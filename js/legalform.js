
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
    var ltriToUrl = require('./lib/ltri-to-url');
    var LegalFormHtml = require('./legalform-html');
    var LegalFormCalc = require('./legalform-calc');
}

function LegalForm($) {
    if (typeof $ === 'undefined') {
        $ = window.jQuery;
    }

    /**
     * Build form html
     * @param  {array} definition  Form definition
     * @return {string}            Form html
     */
    this.build = function(definition) {
        var handler = new LegalFormHtml($);
        return handler.build(definition);
    }

    /**
     * Calculate form data based on definition
     * @param  {array} definition  Form definition
     * @return {object}
     */
    this.calc = function(definition) {
        var handler = new LegalFormCalc($);
        return handler.calc(definition);
    }
}
