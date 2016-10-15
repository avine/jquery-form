
////////////////////////
// jQuery avnButtonGroup plugin

(function ($) {

  var name = 'avnButtonGroup', // Plugin name

  settings = {
    data: [], // [{ label: '', value: '', checked: false }, ...]

    rootCss: 'avn-form-button-group',

    type: undefined, // 'radio', 'checkbox' or undefined (default)

    vertical: undefined, // true, false or undefined (default)

    fullWidth: undefined, // (only when vertical=false) true, false or undefined (default)
    fixedWidth: undefined, // (only when vertical='false') true, false or undefined (default)

    uncheckRadio: false // (only when type='radio') make possible to uncheck radio buttons
  },

  prototype = {

    init: function () {
      this.$element.addClass(this.options.rootCss);
      this.handler = $.avnForm.input.handleEvents(this.$element, this.getCss('active'), this.options.uncheckRadio);
      if (this.options.data.length) {
        this.callMethod('build', this.options.data);
      } else {
        this.initMarkup();
      }
      var cssDisabled =  this.getCss('disabled');
      this.$element.find('label').each(function () {
        var $label = $(this);
        $label[$label.children('input').prop('disabled') ? 'addClass' : 'removeClass'](cssDisabled);
      });
    },

    wakeup: function () {
      
    },

    getCss: function (suffix) {
      return this.options.rootCss + '-' + suffix;
    },

    initBuildOptions: function () {
      this.options.type = 'radio' === this.options.type ? 'radio' : 'checkbox';

      this.options.vertical = !!this.options.vertical;
      this.$element.addClass(this.getCss(this.options.vertical ? 'v' : 'h'));

      if (!this.options.vertical) {
        if (this.options.fullWidth) this.$element.addClass(this.getCss('h-full'));
        if (this.options.fixedWidth) this.$element.addClass(this.getCss('h-fixed'));
      }
    },

    initMarkup: function () {
      $.avnForm.removeTextNodes(this.$element.get(0));
      this.handler();
    }

  },

  methods = {
    
    build: function (data, adapter) {
      if (!adapter) adapter = {
        label: 'label', value: 'value', checked: 'checked'
      };
      this.initBuildOptions();
      this.$element.empty();

      var nameAttr = this.getCss($.avnForm.uniqueId()), nameIndex = 1;
      (this.options.data = data).forEach(function (item, index) {

        this.$element.append($.avnForm.input.build({
          label: item[adapter.label],
          value: item[adapter.value],
          name: nameAttr + ('checkbox' == this.options.type ? '-' + nameIndex++ : ''),
          type: this.options.type,
          checked: item[adapter.checked]
        }));
        if (this.options.vertical && index < this.options.data.length - 1) {
          this.$element.append('<br />');
        }

      }.bind(this));

      this.initMarkup();
    },

    getSelection: function (part, adapter) { // part = 'label', 'value', or undefined
      return $.avnForm.input.getSelection(this.$element, part, adapter);
    },

    setSelection: function (items, matchLabel) {
      return $.avnForm.input.setSelection(this.$element, items, matchLabel, this.options.uncheckRadio);
    }

  };

  // Generate the new jQuery method $.fn[name]
  $.avnPlugin(name, settings, prototype, methods);

})(jQuery);
