
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = expandCondition;
    var calculationVars = require('./calculation-vars');
}

/**
 * Normalize ractive condition
 * @param  {string}  condition
 * @param  {string}  group         Group name
 * @param  {Boolean} isCalculated  If condition should have syntax of calculated expressions
 * @return {string}
 */
function expandCondition(condition, group, isCalculated) {
    var computedRegexp = calculationVars.computedRegexp;
    var globals = calculationVars.globals;

    // Convert expression to computed
    return condition.replace(computedRegexp, function(match, str, prefix, scoped, keypath) {
        if (str) return match; // Just a string
        if (!scoped && globals.indexOf(keypath) !== -1) return match; // A global, not a keypath

        //Keypath
        var name = (scoped && group ? group + '.' : '') + keypath;
        if (isCalculated) name = '${' + name + '}';

        return prefix + ' ' + name;
    });
}
