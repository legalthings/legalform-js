
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = endsWith;
}

/**
 * Determine if keypath ends with string
 * @param  {string}  keypath
 * @param  {string}  suffix
 * @return {Boolean}
 */
function endsWith(keypath, suffix) {
    var index = keypath.indexOf(suffix);

    return index !== -1 && index === keypath.length - suffix.length;
}
