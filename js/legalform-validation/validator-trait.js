
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ValidationValidatorTrait;
}

/**
 * Form validator
 */
function ValidationValidatorTrait() {
    this.initFormValidator = function(form) {
        var validator = new FormValidator(form);
        form.element.formValidator = validator;
    }

    this.getFormValidator = function(form) {
        return form.element && form.element.formValidator;
    }

    this.launchFormValidator = function(form) {
        var formElement = form.element;
        formElement && formElement.formValidator && formElement.formValidator.validate();
    }

    this.updateFormValidator = function(form) {
        var formElement = form.element;
        formElement && formElement.formValidator && formElement.formValidator.update();
    }

    this.isFormValidatorInvalid = function(form) {
        var validator = this.getFormValidator(form);

        return validator.isIncomplete() || validator.hasErrors();
    }
}
