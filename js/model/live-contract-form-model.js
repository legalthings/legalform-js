if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LiveContractFormModel;
}

//Methods to work with live contract form schema
function LiveContractFormModel() {
    this.type = 'live_contract_form';

    this.getFieldType = function(field) {
        var schema = field.$schema;

        return schema.substring(
            schema.lastIndexOf('#') + 1
        );
    };

    this.changeFieldType = function(field, type) {
        field.$schema = field.$schema.replace(/#[^#]+$/, '#' + type);
    }

    this.getStepAnchor = function(step) {
        return step.anchor;
    };

    this.getAmountUnits = function(field) {
        return field.options;
    };

    this.getListOptions = function(field) {
        return field.options;
    };

    this.getListSelectedValues = function(field) {
        return field.options_selected;
    };

    this.getLikertData = function(field) {
        return {
            keys: field.keys,
            values: field.values
        }
    };
}
