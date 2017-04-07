
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unescapeDots;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function unescapeDots(keypath) {
    return typeof keypath === 'string' ? keypath.replace(/\\\./g, '.') : keypath;
}
