
/////////////////
// jQuery avnForm

(function ($) {

    var inputManager = {

        // <label class="avn-form-nested-inverted"><input value="" name="" type="checkbox" checked="checked">[LABEL]</label>
        build: function (setting) {
            return $('<label>').addClass('avn-form-nested-inverted').text(setting.label).prepend(
                $('<input />').attr({
                    value: setting.value,
                    name: setting.name,
                    type: setting.type || 'checkbox',
                    checked: setting.checked ? 'checked' : null
                    
                    // TODO: we should add a setting.disabled...
                    //,disabled: setting.disabled ? 'disabled' : null
                })
            );
        },

        // Get inputs group selection
        getSelection: function (root, part, adapter) { // part = 'label', 'value', or undefined
            if (!adapter) adapter = {
                label: 'label', value: 'value'
            };
            var selection = [];
            $(root).find('input:checked').each(function () {
                var $input = $(this),
                    item = {};
                item[adapter.label] = $input.parent().text();
                item[adapter.value] = $input.val();
                selection.push(item);
            });
            if (part) selection.forEach(function (item, i) {
                selection[i] = item[adapter[part]];
            });
            return selection;
        },

        // Set inputs group selection
        setSelection: function (root, items, matchLabel, uncheckRadio, clickHandler) {
            var checked = [],
                checkFirst = 'first' === items, // items accepts special value 'first'
                checkAll = 'all' === items; // items accepts special value 'all'
            if (!checkFirst && !checkAll) {
                items = items || []; // Otherwise items should be array or undefined
                items.forEach(function (value, i) {
                    items[i] = inputManager.value2String(value);
                });
            }
            clickHandler = clickHandler || function ($label, $input, toCheck, isChecked, type) {
                // Warning: on large collection of inputs, this function can leads to performances issues
                if ('checkbox' === type) {
                    if (isChecked !== toCheck) $label.trigger('click');
                } else/* if ('radio' === type)*/ { // If it's not a "checkbox", it's obviously a "radio"...
                    if (!isChecked && toCheck) $label.trigger('click');
                }
            };
            // We have to loop on the set of inputs twice!
            // Indeed, in case we are dealing with a set of "radio" inputs, they are all connected.
            // And (unlike for "checkbox" inputs) clicking on one of them will affect all the others...
            // Thus, the first loop is designed to find "checked" status of all inputs before touching them...
            var isChecked = [];
            $(root).find('input').each(function (index) {
                isChecked[index] = $(this).prop('checked');
            });
            // Here we go for the second loop which will affect the inputs status
            $(root).find('input').each(function (index) {
                var $input = $(this),
                    $label = $input.parent(),

                    inputVal = $input.val(),
                    labelText = $label.text(),

                    type = $input.attr('type'),
                    toCheck;

                if (checkFirst) {
                    toCheck = 0 === index;
                } else if (checkAll) {
                    toCheck = true;
                } else {
                    toCheck = !!~$.inArray(matchLabel ? labelText : inputVal, items);
                }
                if ('radio' === type && isChecked[index] && uncheckRadio && !items.length) {
                    // Process manually the special feature that is able to uncheck a set of "radio" inputs.
                    // In this case, we must bypass the defined clickHandler() and explicitly trigger
                    // the  click, to call the handleEvents() and handle the uncheck process properly.
                    $label.trigger('click');
                } else {
                    // Warning: inside the clickHandler, use the parameter "isChecked[index]" to determine the revelant input status,
                    // and do not use $input.prop('checked') which is unrevelant for a set of "radio" inputs as we explained above.
                    // Note: The parameter "type" is just a shortcut for $input.attr('type')...
                    clickHandler($label, $input, toCheck, isChecked[index], type);
                }
                if (toCheck) checked.push(this);
            });
            return $(checked);
        },

        // Handle click and change events
        handleEvents: function (root, cssActive, uncheckRadio) {
            var
            $root = $(root),
            map = [],
            handler = function (e) {
                if (!e) map = []; // Calling the method without parameter will init the map
                // click
                if (uncheckRadio && e && 'click' === e.type && 'label' === e.target.nodeName.toLowerCase()) {
                    map.forEach(function (item) {
                        if (e.target === item.label && item.checked) {
                            var $input = $(item.label).children('input');
                            if ('radio' === $input.attr('type')) {
                                e.preventDefault();
                                // Uncheck radio button
                                $(item.label).children('input').prop('checked', false).trigger('change');
                            }
                        }
                    });
                }
                // change
                if (!e || 'change' === e.type) {
                    map = [];
                    $root.find('label').each(function () {
                        var $label = $(this), $input = $label.children('input'),
                            isChecked = $input.prop('checked') && !$input.prop('disabled');
                        $label[isChecked ? 'addClass' : 'removeClass'](cssActive);
                        map.push({ label: this, checked: isChecked });
                    });
                }
            };
            $root.on('change click', handler);
            return handler;
        },

        value2String: function (v) {
            return !!~$.inArray(v, [undefined, null]) ? '' : (v + '');
        }

    };

    // Warning: This script (avnForm.js) should only be loaded once!
    // Indeed, we need to be sure that the handler .selectWrapperEventHandler is only attached to document.body once!
    if ('avnForm' in $) return;

    $.avnForm = {

        uniqueId: (function () {
            var id = 1;
            return function () { return id++; };
        })(),

        // Remove the #text nodes in the childNodes of parentNode
        removeTextNodes: function (parentNode) {
            if (parentNode.contructor === $) parentNode = parentNode[0]; // Remove jQuery wrapper
            Array.prototype.forEach.call(parentNode.childNodes || [], function (childNode) {
                if (3 === childNode.nodeType) parentNode.removeChild(childNode);
            });
        },

        input: inputManager,

        // Addon: Handle focus/blur events when a <select> is wrapped inside a CSS class .avn-form-select
        //      <div class="avn-form-select">
        //          <select><select/>
        //      </div>
        selectWrapperEventHandler: function (e) {
            var $parent = $(e.target.parentNode);
            if (!$parent.hasClass('avn-form-select')) return;
            $parent['focus' == e.type ? 'addClass' : 'removeClass']('avn-form-select-focus');
        }

    };

    $(document).ready(function () {
        // Use event capture to handle focus and blur events on a <div> element
        document.body.addEventListener('focus', $.avnForm.selectWrapperEventHandler, true);
        document.body.addEventListener('blur', $.avnForm.selectWrapperEventHandler, true);
    });

})(jQuery);
