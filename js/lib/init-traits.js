
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = initTraits;
}

/**
 * Attach methods and properties from traits to target object
 * @param {object} target
 * @param {array} traits
 */
function initTraits(target, traits) {
    for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];

        for (var property in trait) {
            target[property] = trait[property];
        }
    }
}
