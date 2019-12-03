
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unescapeDots;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function FormWizard(elWizard) {
    this.elWizard = elWizard;

    this.toStep = function(idx) {
        $(this.elWizard).wizard(idx);
    }
}
