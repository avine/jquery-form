
// Global demo function
window.demoFormActions = function (addDefault) {
    // Expected DOM node
    var $action = $('#demo-form-actions'), addAction = function (text, callback, once) {
        var $button = $('<button>' + text + '</button>')[once ? 'one' : 'on']('click', function (e) {
            callback.call(this, e);
            if (once) $button.remove();
        }).appendTo($action);
        return addAction;
    };
    // Add default actions
    if (undefined === addDefault || !!addDefault) {
        // Toggle the ".avn-font" CSS class (expected to be applied to the <form> element)
        addAction('Toggle ".avn-font"', function () { $('form').toggleClass('avn-form'); });

        // Change the "text-align" CSS value of the <form> element
        var align = ['left', 'center', 'right'], index = 0;
        addAction('Change "text-align"', function () { $('form').css('text-align', align[++index % 3]); });
    }
    // Return the function that make possible to easily add more actions...
    // function signature: addAction(text, callback, once);
    return addAction;
};
