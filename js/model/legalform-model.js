//Methods to work with legalform scheme
function LegalFormModel() {
    this.getFieldType = function(field) {
        return field.type;
    };

    this.getStepAnchor = function(step) {
        return step.article;
    };

    this.getAmountFieldUnits = function(field) {
        return {
            singular: field.optionValue,
            plural: field.optionText
        }
    };

    this.getListOptions = function(field) {
        var options = [];

        for (var i = 0; i < field.optionValue.length; i++) {
            var item = {value: field.optionValue[i], name: field.optionText[i]};
            options.push(item);
        }

        return options;
    };

    this.getListSelectedValues = function(field) {
        return field.value;
    };

    this.getLikertData = function(field) {
        return {
            keys: $.each($.trim(data.keys).split('\n'), $.trim),
            values: $.each($.trim(data.values).split('\n'), $.trim)
        }
    };
}
