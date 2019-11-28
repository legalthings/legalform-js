
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = triggerSelectizeLoad;
}

/**
 * Trigger selectize load
 * @param  {string|object} element
 */
function triggerSelectizeLoad(element) {
    var $element = $(element);
    var selectize = $element.selectize();
    if (!selectize) return;

    selectize = selectize[0].selectize;
    var selectedText = $element.closest('.form-group').find('.selectize-control .selectize-input > .item:first-child').html();
    if (typeof selectedText === 'undefined') selectedText = '';

    selectize.onSearchChange(selectedText);
}
