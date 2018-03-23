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
        var type = this.getFieldType(field);

        return ['select', 'group'].indexOf(type) !== -1 ?
            this.getListSelectedValues(field) :
            field.value;
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
