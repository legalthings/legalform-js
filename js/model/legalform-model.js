if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalFormModel;
}

//Methods to work with legalform schema
function LegalFormModel() {
    this.type = 'legal_form';

    this.getFieldType = function(field) {
        return field.type;
    };

    this.changeFieldType = function(field, type) {
        field.type = type;
    }

    this.getStepAnchor = function(step) {
        return step.article;
    };

    this.getAmountUnits = function(field, split) {
        return split ?
            {singular: field.optionValue, plural: field.optionText} :
            buildOptions(field, 'singular', 'plural');
    };

    this.getListOptions = function(field) {
        return buildOptions(field, 'value', 'name');
    };

    this.getFieldValue = function(field) {
        return field.value;
    };

    this.getListSelectedValues = function(field) {
        return field.value;
    };

    this.getLikertData = function(field) {
        return {
            keys: splitLikertItems(field.keys),
            values: splitLikertItems(field.values)
        };
    };

    function splitLikertItems(items) {
        return items.trim().split("\n").map(function(value) {
            return value.trim();
        });
    }

    function buildOptions(field, keyName, valueName) {
        var options = [];

        for (var i = 0; i < field.optionValue.length; i++) {
            var item = {};
            item[keyName] = field.optionValue[i];
            item[valueName] = field.optionText[i];

            options.push(item);
        }

        return options;
    }
}
