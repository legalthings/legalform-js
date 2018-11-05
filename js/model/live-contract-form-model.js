if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LiveContractFormModel;
}

//Methods to work with live contract form schema
function LiveContractFormModel() {
    var typeReg = /#[^#]+$/;
    this.type = 'live_contract_form';

    this.getFieldType = function(field) {
        var map = {'select-group' : 'group'};
        var schema = field.$schema;
        var type = schema.substring(
            schema.lastIndexOf('#') + 1
        );

        return typeof map[type] !== 'undefined' ? map[type] : type;
    };

    this.changeFieldType = function(field, type) {
        field.$schema = field.$schema.replace(typeReg, '#' + type);
    }

    this.getStepAnchor = function(step) {
        return step.anchor;
    };

    this.getAmountUnits = function(field, split) {
        if (!split) return field.options;

        var singular = [];
        var plural = [];

        for (var i = 0; i < field.options.length; i++) {
            var option = field.options[i];

            singular.push(option.singular);
            plural.push(option.plural);
        }

        return {
            singular: singular,
            plural: plural
        };
    };

    this.getListOptions = function(field) {
        return field.options;
    };

    this.getFieldValue = function(field) {
        return field.default;
    };

    this.getDateLimits = function(field) {
        return {};
    };

    this.getLikertData = function(field) {
        return {
            keys: field.keys,
            options: field.options
        }
    };

    //This is used when working with copy of field data, so not with original form definition
    //Used when building form html
    this.syncValueField = function(field) {
        if (typeof(field.default) === 'undefined') return;

        field.value = field.default;
        delete field.default;
    };

    this.isCheckboxFieldChecked = function(field) {
        return !!field.checked;
    };
}
