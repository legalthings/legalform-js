
function FormValidatorBootstrapVariant() {
    FormValidatorBootstrapVariant.prototype.toggleSubmit = function(button, disabled) {
        $(button).toggleClass('disabled', disabled);
    }
}
