
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = parseNumber;
    var calculationVars = require('./calculation-vars');
}

var numberRegexp = new RegExp(calculationVars.numberPattern);
var dotRegexp = /\./g;
var commaRegexp = /,/g;

/**
 * Create float number from number, given by string with decimal comma/dot
 * @param {string} number
 * @return {float|null}
 */
function parseNumber(number) {
    if (typeof number === 'undefined' || number === null) return null;

    number = number.toString();
    var match = number.match(numberRegexp);
    if (!match) return null;

    var isDecimalComma = typeof match[1] !== 'undefined';

    number = isDecimalComma ?
        number.replace(dotRegexp, '').replace(',', '.') :
        number.replace(commaRegexp, '');

    return parseFloat(number);
}
