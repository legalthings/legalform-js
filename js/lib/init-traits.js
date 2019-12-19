
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
            var value = trait[property];
            var current = target[property];
            var passParent = typeof current === 'function' && typeof value === 'function';

            if (passParent) {
                value = setMethodWithParent(value, current);
            }

            target[property] = value;
        }
    }
}

function setMethodWithParent(method, parent) {
    return function() {
        var args = [].slice.call(arguments);
        args.push(parent.bind(this));

        return method.apply(this, args);
    }
}
