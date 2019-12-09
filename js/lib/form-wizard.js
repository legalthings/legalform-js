
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormWizard;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function FormWizard(elWizard) {
    this.elWizard = elWizard.element;

    this.refresh = function() {
        $(this.elWizard).wizard('refresh');
    }

    this.toStep = function(idx) {
        $(this.elWizard).wizard(idx);
    }
}
