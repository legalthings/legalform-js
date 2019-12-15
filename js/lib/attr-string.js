
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = attrString;
}

/**
 * Build string of attributes for html input
 * @param  {object} data     Field data
 * @param  {string} exclude  List of attributes to exclude
 * @return {string}
 */
function attrString(data, exclude) {
    if (typeof data === 'undefined') return '';

    var dataKeys = 'mask'.split(';');

    if (typeof exclude === 'undefined') exclude = '';
    if (exclude === false) {
        exclude = [];
    } else {
        exclude += ';label;keys;values;conditions;text;optionValue;optionText;optionSelected;options;helptext;$schema;nameNoMustache';
        exclude = exclude.split(';');
    }

    var attr = '';
    for (var key in data) {
        if (data[key] && exclude.indexOf(key) < 0) {
            var prefix = dataKeys.indexOf(key) < 0 ? '' : 'data-';
            attr += prefix + key + '="' + data[key] + '" ';
        }
    }

    return attr.trim();
}
