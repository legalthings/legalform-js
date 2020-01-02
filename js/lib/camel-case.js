
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = toCamelCase;
}

/**
 * Convert css-like string (e.g. property name) to camel case
 * @param  {string} str
 * @return {string}
 */
function toCamelCase(str){
    return str.split('-').map(function(word, index) {
        if (index === 0){
            return word.toLowerCase();
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
}
