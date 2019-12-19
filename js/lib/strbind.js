
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = strbind;
}

/**
 * Insert values into string
 * @param  {string} text
 * @return {string}
 */
function strbind(text) {
    var i = 1, args = arguments;
    return text.replace(/%s/g, function(pattern) {
        return (i < args.length) ? args[i++] : "";
    });
}
