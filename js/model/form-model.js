//Get needed type of model to wrok with given form scheme
function FormModel(definition) {
    var model = typeof definition.scheme !== 'undefined' ?
        new LiveContractFormModel() :
        new LegalFormModel();

    this.getModel = function() {
        return model;
    };
}
