//Methods to work with live contract form scheme
function LiveContractFormModel() {
    this.getFieldType = function(field) {
        var scheme = field.scheme;

        return scheme.substring(
            scheme.lastIndexOf('#') + 1
        );
    };

    this.getStepAnchor = function(step) {
        return step.anchor;
    };

    this.getAmountFieldUnits = function(field) {
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
