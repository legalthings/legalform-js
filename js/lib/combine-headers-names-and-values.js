
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = combineHeadersNamesAndValues;
}

/**
 * Build object of http headers from headers names and values
 * @param  {array|string} names   Headers names
 * @param  {array|string} values  Headers values
 * @return {object}               Map of names to values
 */
function combineHeadersNamesAndValues(names, values) {
    var result = {};

    if (typeof names === 'string') names = [names];
    if (typeof values === 'string') values = [values];

    for (var i = 0; i < names.length; i++) {
        if (typeof values[i] === 'undefined') continue;
        if (typeof result[names[i]] === 'undefined') {
            result[names[i]] = [];
        }

        result[names[i]].push(values[i]);
    }

    return result;
}
