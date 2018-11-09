
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = formatLocale;
}

/**
 * Format locale of template or document
 * @param  {string} locale
 * @param  {string} format
 * @return {string}
 */
function formatLocale(locale, format) {
    var delimiter = '_';
    var pos = locale.indexOf(delimiter);

    if (format === 'short') {
        if (pos !== -1) locale = locale.substr(0, pos);
    } else if (format === 'momentjs') {
        locale = locale.toLowerCase();
        if (pos !== -1) {
            parts = locale.split(delimiter);
            locale = parts[0] === parts[1] ? parts[0] : parts.join('-');
        }
    } else if (format) {
        throw 'Unknown format "' + format + '" for getting document locale';
    }

    return locale;
}
