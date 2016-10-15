
///////////////////////////
// jQuery plugin generator

(function ($) {

  var propList = function (object) {
    var list = [];
    for (var prop in object) list.push(prop);
    return list;
  },

  hasChanged = function (source, target) {
    for (var prop in source) if (target[prop] != source[prop]) return true;
    return false;
  },

  isEmpty = function (array) {
    for (var i = 0; i < array.length; i++) if (undefined !== array[i]) return false;
    return true;
  },

  plugin = function (name, settings, prototype, methods) {

    settings = settings || {};

    var Plugin = function (element) {
      this.$element = $(element);
      this.pluginName = name; // helper for debugging
      this.pluginMethods = propList(methods); // helper for debugging
    };

    var dataName = 'jquery-avn-plugin-instance-' + name;

    $.extend(Plugin.prototype = {
      _wakeup: function (options) {
        var isOptions = $.isPlainObject(options);
        this.optionsHasChanged = !!(isOptions && this.options && hasChanged(options, this.options));
        if (!this.options || isOptions) this.options = $.extend({}, settings, this.options || {}, isOptions ? options : {});
        if (this.isInit && 'init' in this) this.init.apply(this, arguments);
        if ('wakeup' in this) this.wakeup.apply(this, arguments);
      },
      callMethod: function (action) {
        if (action in methods) return methods[action].apply(this, Array.prototype.slice.call(arguments, 1));
      },
      destroy: function () {
        this.$element.data(dataName, null);
      }
    }, prototype || {});

    methods = methods || {};
    if (!methods.debug) methods.debug = function () { console.log(this); return this; }; // helper for debugging

    var fn = function (action) {
      var result = [], args = arguments;
      $.each(this, function () {
        var $this = $(this), p = $this.data(dataName), isInit = !p, r; // p=plugin, r=result
        if (isInit) $this.data(dataName, p = new Plugin(this)); // Store the new instance
        p.isInit = isInit;
        if (!(action in methods)) {
          p._wakeup.apply(p, args || []);
          if (p.options.defaultMethod && !p.optionsHasChanged) r = methods[p.options.defaultMethod].apply(p);
        } else {
          p._wakeup();
          r = methods[action].apply(p, Array.prototype.slice.call(args, 1));
        }
        result.push(r);
      });
      if (isEmpty(result)) return this;
      return (1 == result.length) ? result[0] : result;
    };

    // Expose configuration
    fn.settings = settings;
    fn.methods = methods;

    // Extend jQuery
    $.fn[name] = fn;
  };

  $.avnPlugin = plugin;

})(jQuery);

/*
///////////////////////
// jQuery avnXXX plugin

(function ($) {

  var name = 'avnXXX', // Plugin name

  settings = {

  },

  prototype = {
    init: function () {

    },
    wakeup: function () {

    }
  },

  methods = {

  };

  // Generate the new jQuery method $.fn[name]
  $.avnPlugin(name, settings, prototype, methods);

})(jQuery);
*/

//////////////////////////////////
// Mobile device detection
// desktop/mobile events switcher

(function ($, isMobile) {

  if (undefined === isMobile) {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  var desktop = ['mousedown', 'mouseup', 'mousemove', 'mouseleave'],
    mobile = ['touchstart', 'touchend', 'touchmove', 'touchleave'];

  var from, to;
  if (isMobile) { from = desktop; to = mobile; } else { from = mobile; to = desktop; }

  for (var map = {}, i = 0; i < from.length; i++) map[from[i]] = to[i];

  var namespace = 'avnEvent';

  var events = function(e) {
    e = [].concat(e).join(' ').match(/\S+/g) || [''];
    for (var i = 0; i < e.length; i++) {
      var s = e[i].split('.'), event = s.shift(), ns = s;
      if (event in map) event = map[event];
      if (!~ns.indexOf(namespace)) ns.push(namespace);
      e[i] = event + '.' + ns.join('.');
    }
    return e.join(' ');
  };

  // Expose
  $.avnPlugin.isMobile = !!isMobile;
  $.avnPlugin.namespace = namespace;
  $.avnPlugin.events = events;

})(jQuery);
