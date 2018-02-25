
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = escapeDots;
}

/**
 * Escape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function escapeDots(keypath) {
    return typeof keypath === 'string' ? keypath.replace(/\./g, '\\.') : keypath;
}
