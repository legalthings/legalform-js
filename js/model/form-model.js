if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormModel;
    var LiveContractFormModel = require('./live-contract-form-model');
    var LegalFormModel = require('./legalform-model');
}

//Get needed type of model to work with given form schema
function FormModel(definition) {
    var modelType = determineModelType(definition);
    var model = modelType === 'legal_form' ?
        new LegalFormModel() :
        new LiveContractFormModel();

    this.getModel = function() {
        return model;
    };

    function determineModelType(definition) {
        //Definition is a single field
        if (!Array.isArray(definition)) {
            return definition.$schema ? 'live_contract_form' : 'legal_form';
        }

        //Definition
        var modelType = 'legal_form';

        for (var i = 0; i < definition.length; i++) {
            var fields = definition[i].fields;
            if (!fields || !fields.length) continue;

            if (fields[0].$schema) modelType = 'live_contract_form';
            break;
        }

        return modelType;
    }
}
