
function FormValidatorBulmaVariant() {
    FormValidatorBulmaVariant.prototype.toggleSubmit = function(button, disabled) {
        button = new DomElement(button);

        disabled ?
            button.attr('disabled', '') :
            button.removeAttr('disabled');
    }
}
