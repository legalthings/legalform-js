/**
 * Bootstrap validator
 */
function BootstrapValidatorTrait() {
    this.initFormValidator = function(form) {
        $(form).validator();
    }

    this.getFormValidator = function(form) {
        return $(form).data('bs.validator');
    }

    this.launchFormValidator = function(form) {
        $(form).validator('validate');
    }

    this.updateFormValidator = function(form) {
        $(form).validator('update');
    }

    this.isFormValidatorInvalid = function(form) {
        var validator = this.getFormValidator(form);

        return validator.isIncomplete() || validator.hasErrors();
    }
}
