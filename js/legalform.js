
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
    var LegalFormHtml = require('./legalform-html');
    var LegalFormCalc = require('./legalform-calc');
}

function LegalForm(variant) {
    /**
     * Build form html
     * @param  {array} definition       Form definition
     * @param  {object} builderOptions  Additional options for buildong form html
     * @return {string}                 Form html
     */
    this.build = function(definition, builderOptions) {
        var handler = new LegalFormHtml(variant);
        return handler.build(definition, builderOptions);
    }

    /**
     * Calculate form data based on definition
     * @param  {array} definition  Form definition
     * @return {object}
     */
    this.calc = function(definition) {
        var handler = new LegalFormCalc();
        return handler.calc(definition);
    }

    /**
     * Build form help html
     * @param  {array} definition  Form definition
     * @return {string}            Form help text html
     */
    this.buildHelpText = function(definition) {
        var handler = new LegalFormHtml(variant);
        return handler.buildHelpText(definition);
    }

    /**
     * Build html for single form field
     * @param  {object} field
     * @param  {string} group           Group name
     * @param  {string} mode            'use' or 'build'
     * @param  {boolean} isFormEditable
     * @return {string}                 Field html
     */
    this.buildField = function(field, group, mode, isFormEditable) {
        var handler = new LegalFormHtml(variant);
        return handler.buildField(field, group, mode, isFormEditable);
    }
}
