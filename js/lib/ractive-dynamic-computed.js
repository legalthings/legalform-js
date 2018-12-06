/**
 * Dynamic addition and removing of computed properties in current used version of Ractive (0.9.13) is not supported out of the box.
 * So we use this object for that purpose. It uses code, extracted from ractive, and simplified to only cover our needs
 * (that is only support computed properties, given as strings).
 */

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = RactiveDynamicComputed;
}

function RactiveDynamicComputed() {
    var self = this;

    this.dotRegExp = /\./g;
    this.computedVarRegExp = /\$\{([^\}]+)\}/g;

    /**
     * Remove computed property from existing rative instance
     * @param  {object} ractive
     * @param  {string} key
     */
    this.remove = function(ractive, key) {
        var escapedKey = key.replace(dotRegExp, '\\.');

        delete ractive.computed[key];
        delete ractive.viewmodel.computations[escapedKey];
    }

    /**
     * Add computed expression to existing ractive instance
     * @param {object} ractive
     * @param {string} key
     * @param {string} value
     */
    this.add = function(ractive, key, value) {
        var signature = getComputationSignature(ractive, key, value);

        ractive.computed[key] = value;
        ractive.viewmodel.compute(key, signature);
    }

    function getComputationSignature(ractive, key, signature) {
        if (typeof signature !== 'string') {
            throw 'Unable to dynamically add computed property with value of type ' + (typeof signature);
        }

        var getter = createFunctionFromString(signature, ractive);
        var getterString = signature;

        return {
            getter: getter,
            setter: undefined,
            getterString: getterString,
            setterString: undefined,
            getterUseStack: undefined
        };
    }

    function createFunctionFromString(str, bindTo) {
        var hasThis;

        var functionBody = 'return (' + str.replace(self.computedVarRegExp, function (match, keypath) {
            hasThis = true;
            return ("__ractive.get(\"" + keypath + "\")");
        }) + ');';

        if (hasThis) { functionBody = "var __ractive = this; " + functionBody; }
        var fn = new Function( functionBody );
        return hasThis ? fn.bind( bindTo ) : fn;
    }
}
