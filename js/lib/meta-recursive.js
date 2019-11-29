
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = metaRecursive;
}

/**
 * Apply callback to the meta data of each field
 *
 * @param {string}   key
 * @param {object}   meta
 * @param {function} callback
 */
function metaRecursive(key, meta, callback) {
    if (arguments.length === 2) {
        callback = meta;
        meta = key;
        key = null;
    }

    if (!meta) {
        meta = {};
    }

    if (typeof meta.type === 'undefined' || typeof meta.type === 'object') {
        for (k2 in meta) {
            metaRecursive((key ? key + '.' : '') + k2, meta[k2], callback);
        }

        return;
    }

    callback(key, meta);
}
