
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = isObject;
}

/**
 * Check if value is simple object
 *
 * @param {mixed} value
 * @return {boolean}
 */
function isObject(value) {
    return (!!value) && (value.constructor === Object);
}
