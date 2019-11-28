
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
        $.each(meta, function(k2, m2) {
            metaRecursive((key ? key + '.' : '') + k2, m2, callback)
        });

        return;
    }

    callback(key, meta);
}
