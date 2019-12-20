
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = setAmountToStringMethod;
}

/**
 * Set toString method for number with unit field
 * @param {object} value
 */
function setAmountToStringMethod(value) {
    if (!value.hasOwnProperty('toString')) {
        //Set toString method
        var toString = function() {
            return (this.amount !== '' && this.amount !== null) ? this.amount + ' ' + this.unit : '';
        };

        defineProperty(value, 'toString', toString);
    }
}
