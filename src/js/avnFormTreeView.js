
/////////////////////
// jQuery avnTreeView plugin

(function ($) {

    var name = 'avnTreeView', // Plugin name

	settings = {
	    data: [],
	    type: undefined,

	    uncheckRadio: false, // (only when type='radio') make possible to uncheck radio buttons
	    closeButton: false,
	    uncheckButton: false,
	    threeStates: false, // (only when type='checkbox')

	    dropDown: false,
		viewItemsNum: 5, // (only when dropDown=true) view checked items like this: "Item1 | Item 2 | Item 3"
		viewItemsSep: '|', // (only when dropDown=true)
	    viewItemsText: 'items', // (only when dropDown=true) view checked items like this: "3 items"

	    rootCss: 'avn-form-tree-view',
	    parentTag: 'ul',
	    childTag: 'li',

	    animDuration: 200 // should be same as the duration of .avn-form-tree-view-toggle transition (defined in css)
	},

	prototype = {

	    init: function () {
	        this.$element.addClass(this.getCss('wrap'));
	        this.$root = this.$element.children(this.options.parentTag); // from DOM
	        if (!this.$root.length) {
	            this.$root = $('<' + this.options.parentTag + '>');
	            this.$element.empty().append(this.$root);
	        }
	        this.$root.addClass(this.options.rootCss).on($.avnPlugin.events('mousedown'), this.handleToggle.bind(this));
	        this.handler = $.avnForm.input.handleEvents(this.$root, this.getCss('active'), this.options.uncheckRadio);

	        if (this.options.closeButton) this.addTool('close');
	        if (this.options.uncheckButton) this.addTool('uncheck');
	        if (this.options.dropDown) this.buildDropDown();

	        if (this.options.data.length) {
	            this.callMethod('build', this.options.data);
	        } else {
	            this.initMarkup();
	        }
	    },

	    buildDropDown: function () {
	        var $tree = this.$element.children().detach();
	        this.$trigger = $('<div>').addClass(this.getCss('drop-trigger')).appendTo(this.$element);
	        this.$target = $('<div>').addClass(this.getCss('drop-target')).appendTo(this.$element).append($tree);
	        this.$element.on('change', this.updateDropDownTrigger.bind(this));

	        this.$trigger.on($.avnPlugin.events('mousedown'), function () {
	            this.$target.toggleClass(this.getCss('drop-active'));
	        }.bind(this));

	        var timeout;
	        this.$element.on('mouseover', function (e) {
	            clearTimeout(timeout);
	        }).on('mouseout', function (e) {
	            timeout = setTimeout(function () {
	                this.$target.removeClass(this.getCss('drop-active'));
	            }.bind(this), 500);
	        }.bind(this));
	    },

	    updateDropDownTrigger: function () {
	        var selection = this.callMethod('getSelection', 'label'), length = selection.length, text;
			if (0 === length) {
				text = '';
			} else if (length <= this.options.viewItemsNum) {
				text = selection.join('<span class="' + this.getCss('drop-sep') + '">' +
						this.options.viewItemsSep + '</span>');
			} else {
				text = length + ' ' + this.options.viewItemsText
			}
	        this.$trigger.html(text);
	        if ('radio' === this.options.type) this.$element.trigger('mouseout'); // Close drop down
	    },

	    wakeup: function () {

	    },

	    getCss: function (suffix) {
	        return this.options.rootCss + '-' + suffix;
	    },

	    handleToggle: function (e) {
	        var $toggle = $(e.target);
	        if (!$toggle.hasClass(this.getCss('toggle'))) return;
	        e.stopPropagation();
	        var $node = $toggle.nextAll(this.options.parentTag), // <ul>
		        $wrap = $node.parent(this.options.childTag); // <li> parent
	        if (!$node.length) return;
	        if (this.options.animDuration) {
	            this.animateTree($node, $wrap);
	        } else {
	            $wrap.toggleClass(this.getCss('open'));
	        }
	    },

	    animateTree: function ($node, $wrap) {
	        var cssOpen = this.getCss('open');
	        if (!$wrap.hasClass(cssOpen)) {
	            $wrap.addClass(cssOpen);
	            var h = $node.css('height');
	            $node.css('height', '0px').animate({ height: h }, this.options.animDuration, function () {
	                $node.css('height', 'auto');
	            });
	        } else {
	            $node.animate({ height: '0px' }, this.options.animDuration, function () {
	                $wrap.removeClass(cssOpen);
	                $node.css('height', 'auto');
	            });
	        }
	    },

	    initMarkup: function () {
	        this.traverse();

	        var oneLevel = !this.$root.children(this.options.childTag).children(this.options.parentTag).length;
	        this.$root[oneLevel ? 'addClass' : 'removeClass'](this.getCss('single'));

	        this.handler();
	        if (this.options.dropDown) this.updateDropDownTrigger();
	    },

	    traverse: function ($parent) {
	        ($parent || this.$root).children(this.options.childTag).each(function (index, child) {
	            $.avnForm.removeTextNodes(child);
	            var $child = $(child), $checked = $child.children('label').children('input:checked');
	            if ($checked.length) this.callMethod('expand', $checked);
	            var $next = $child.children(this.options.parentTag);
	            if (!$next.length) {
	                $('<i>').addClass(this.getCss('shift')).prependTo($child);
	            } else {
	                $('<span>').addClass(this.getCss('toggle')).prependTo($child);
	                if (this.options.threeStates) this.addThreeStates($next);
	                this.traverse($next);
	            }
	            // If not yet defined, init type from the first input founded
				if (undefined === this.options.type) {
					var type = $child.children('label').children('input').first().attr('type');
					if (type) this.options.type = type.toLowerCase();
				}
	        }.bind(this));
	    },

	    addThreeStates: function ($parentTag) {
	        var $3states = $('<i>').addClass(this.getCss('3states')).insertBefore($parentTag),
                $scope = $parentTag.parent(this.options.childTag);

	        $3states.on($.avnPlugin.events('mousedown'), function (e) {
	            var state = $3states.attr('data-state'), selection = this.callMethod('getSelection', 'value');
	            $scope.find('input').each(function () {
	                var value = $(this).val(), index = $.inArray(value, selection);
	                switch (state) {
	                    case "none": case "half": if (-1 === index) selection.push(value); break;
	                    case "all": if (-1 !== index) selection.splice(index, 1); break;
	                }
	            });
	            this.callMethod('setSelection', selection, false, false);
	            if ('all' !== state) this.callMethod('expand', $scope.find('input'));
	        }.bind(this));

	        var onChange = function (e) {
	            var $all = $scope.find('input'), checkedLength = $all.filter(':checked').length;
	            if (0 === checkedLength) {
	                $3states.attr('data-state', "none");
	            } else if ($all.length > checkedLength) {
	                $3states.attr('data-state', "half");
	            } else {
	                $3states.attr('data-state', "all");
	            }
	        }.bind(this);
	        $scope.on('change threeStatesChange', onChange);
	        onChange();
	    },

	    setData: function (data, adapter) {
	        if (!adapter) adapter = {
	            label: 'label', value: 'value', parentValue: 'parentValue', checkable: 'checkable', checked: 'checked'
	        };
	        this.options.data = [];
	        data.forEach(function (_item) {
	            var item = {};
	            item.label = _item[adapter.label];
	            item.value = $.avnForm.input.value2String(_item[adapter.value]);
	            if (!!~$.inArray(_item[adapter.parentValue], [undefined, false, null])) {
	                item.parentValue = null; // root item
	            } else {
	                item.parentValue = $.avnForm.input.value2String(_item[adapter.parentValue]); // child item
	                // If .parentValue has exactly the same value as the .value then it's a again root item
	                if (item.value === item.parentValue) item.parentValue = null;
	            }
	            item.checkable = !!~$.inArray(_item[adapter.checkable], [undefined, true, 1, "1"]);
	            item.checked = !!_item[adapter.checked];
	            this.options.data.push(item);
	        }.bind(this));
	    },

	    get$leave: function (item) {
	        var $leave = $('<' + this.options.childTag + '>').data('value', item.value); // Store item.value
	        if (item.checkable) {
	            $leave.append($.avnForm.input.build({
	                label: item.label,
	                value: item.value,
	                name: this.nameAttr + ('checkbox' === this.options.type ? '-' + this._bag.nameIndex++ : ''),
	                type: this.options.type,
	                checked: item.checked ? 'checked' : null
	            }));
	        } else {
	            $('<i>').text(item.label).addClass(this.getCss('disabled')).appendTo($leave);
	        }
	        return $leave;
	    },

	    getLeaves: function (parentValue) {
	        var $leaves = [];
	        this._bag.seeds = this._bag.seeds.filter(function (item) {
	            if (null === parentValue && null === item.parentValue || parentValue === item.parentValue) {
	                $leaves.push(this.get$leave(item));
	            } else {
	                return true;
	            }
	        }.bind(this));
	        return $leaves;
	    },

	    getTree: function (parentValue, isRoot) {
	        var $parent = isRoot ? this.$root : jQuery('<' + this.options.parentTag + '>'),
				$leaves = this.getLeaves(parentValue);
	        if (!$leaves.length) return;
	        $leaves.forEach(function ($childs) {
	            $parent.append($childs);
	            var $tree = this.getTree($childs.data('value')); // Retrieve item.value
	            if ($tree) $childs.append($tree);
	        }.bind(this));
	        return $parent;
	    },

	    initBuildOptions: function () {
	        this.options.type = 'radio' === this.options.type ? 'radio' : 'checkbox';
	    },

	    toggleChilds: function ($childTags, toOpen) {
	        $childTags.each(function (index, childTag) {
	            var $childTag = $(childTag),
                    $toggle = $childTag.children('.' + this.getCss('toggle')),
                    isOpen = $childTag.hasClass(this.getCss('open'));
	            if (!$toggle.length) return;
	            if (undefined === toOpen || !toOpen && isOpen || toOpen && !isOpen) {
	                $toggle.trigger($.avnPlugin.events('mousedown'));
	            }
	        }.bind(this));
	    },

	    addTool: function (action) {
	        this.$tool = this.$tool || $('<div>').addClass(this.getCss('tool')).appendTo(this.$element);

	        var $action = $('<span>').addClass(this.getCss(action)).prependTo(this.$tool),
                cssReverse = this.getCss('reverse');
	        switch (action) {
	            case 'close':
	                $action.addClass(cssReverse).on($.avnPlugin.events('mousedown'), function () {
	                    if (!$action.hasClass(cssReverse)) {
	                        this.callMethod('close');
	                    } else {
	                        this.callMethod('expand', this.$root.find(this.options.childTag));
	                    }
	                    $action.toggleClass(cssReverse);
                    }.bind(this));
	                break;
	            case 'uncheck':
	                $action.on($.avnPlugin.events('mousedown'), function () {
						var items = null; // Uncheck all items
						if ('checkbox' === this.options.type && !this.$root.find('input:checked').length) {
							items = 'all'; // Check all items
						}
	                    this.callMethod('setSelection', items, null, false);
	                }.bind(this));
	                break;
	        }
	    }

	},

	methods = {

		build: function (data, adapter) {
		    this.initBuildOptions();
			this.$root.empty();

			this.setData(data, adapter);

			this.nameAttr = this.nameAttr || this.getCss($.avnForm.uniqueId()); // unique for the instance
			this._bag = { nameIndex: 1, seeds: $.extend([], this.options.data) };
			this.getTree(null, true);
			delete this._bag;

			this.initMarkup();
		},

		getSelection: function (part, adapter) { // part = 'label', 'value', or undefined
		    return $.avnForm.input.getSelection(this.$root, part, adapter);
		},

		setSelection: function (items, matchLabel, adaptView) {
            // To change the state of the three view, the academic process consists to trigger a click event on each $label which needs to be clicked.
		    // But on large input collections, this can lead to real performances issues !
		    // To prevent this, we need to change the state of the three view "manually" without triggering 'click' events !
		    // To do that, we updates manually the 'checked' property of the inputs and the css class 'active' of the labels.
		    var cssActive = this.getCss('active'),
            clickHandler = function ($label, $input, toCheck, isChecked, type) {
		        $input.prop('checked', toCheck);
		        $label[toCheck ? 'addClass' : 'removeClass'](cssActive);
		    }.bind(this);

		    var $checked = $.avnForm.input.setSelection(this.$root, items, matchLabel, this.options.uncheckRadio, clickHandler);

		    if (this.options.threeStates) {
		        // Handle manually the update of the three-states buttons
		        $(this.$root).find('.' + this.getCss('toggle')).parent(this.options.childTag).trigger('threeStatesChange');
		    }
            
		    // Here's the tricky part ! Triggers only one single 'change' event on the top of the tree view...
		    this.$element.trigger('change', { '$checked': $checked });

		    if (undefined === adaptView || adaptView) {
		        this.callMethod('close', true); // skip animmation
		        this.callMethod('expand', $checked);
		    }
		    return $checked;
		},

	    // nodes parameter is a collection of tags: <input />, <label> or <li> (ie: this.options.childTag)
		expand: function (nodes) {
		    var childTags = [], childTag = this.options.childTag;
		    jQuery(nodes).each(function () {
		        if (this.nodeName.toLowerCase() === childTag) {
		            childTags.push(this);
		        } else {
		            var $cT = $(this).closest(childTag);
		            if ($cT.length) childTags.push($cT[0]);
		        }
		    });
		    if (childTags.length) this.toggleChilds($(childTags).parentsUntil(this.$root, this.options.childTag), true);
		},

		close: function (skipAnim) {
		    if (skipAnim) {
		        this.$root.find(this.options.childTag).removeClass(this.getCss('open'));
		    } else {
		        this.toggleChilds(this.$root.find(this.options.childTag), false);
		    }
		}

	};

	// Generate the new jQuery method $.fn[name]
	$.avnPlugin(name, settings, prototype, methods);

})(jQuery);
