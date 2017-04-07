
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = defineProperty;
}

/**
 * Define non-enumarable getter property on object
 *
 * @param {object} object
 * @param {string} name
 * @param {function} method
 */
function defineProperty(object, name, method) {
    Object.defineProperty(object, name, {
        enumerable: false,
        configurable: false,
        get: function() {
            return method;
        }
    });
}
