
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { setByKeyPath, getByKeyPath };
}

/**
 * Set (nested) property of object using dot notation
 *
 * @param {object} target
 * @param {string} key
 * @param          value
 */
function setByKeyPath(target, key, value) {
    var parts = key.split('.');

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        if (i < parts.length -1) {
            if (typeof target[part] !== 'object') {
                target[part] = {};
            }

            target = target[part];
        } else {
            target[part] = value;
        }
    }
}

/**
 * Get (nested) property of object using dot notation
 *
 * @param {object} target
 * @param {string} key
 * @param          defaultValue
 */
function getByKeyPath(target, key, defaultValue) {
    if (!target || !key) return false;

    key = key.split('.');
    var l = key.length,
        i = 0,
        p = '';

    for (; i < l; ++i) {
        p = key[i];

        if (target.hasOwnProperty(p)) target = target[p];
        else return defaultValue;
    }

    return target;
}
