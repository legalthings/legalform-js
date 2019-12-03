/**
 * Bootstrap-specific implementation of some legalform-js methods
 */
function BootstrapVariant() {
    var self = this;

    this.initTooltip = function(element, show) {
        var $element = $(element);
        var inited = $element.data('bs.tooltip');

        if (!inited) {
            $element.tooltip({
                placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right',
                container: 'body'
            });
        }

        if (!inited || show) $element.tooltip('show');
    }

    this.isTooltipShown = function(help) {
        var tooltip = $(help).data('bs.tooltip');

        return tooltip && tooltip.$tip.hasClass('in');
    }

    this.hideTooltip = function(help) {
        var $help = $(help);
        var tooltip = $help.data('bs.tooltip');

        if (tooltip && tooltip.$tip.hasClass('in')) $help.tooltip('hide');
    }

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

    this.updateFormScroll = function() {
        $('.form-scrollable').perfectScrollbar('update');
    }
}
