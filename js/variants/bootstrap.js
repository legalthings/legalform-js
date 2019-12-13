/**
 * Bootstrap-specific implementation of some legalform-js functionality
 */
function BootstrapVariant() {
    var self = this;

    var traits = [
        new BootstrapTooltipTrait(),
        new BootstrapValidatorTrait(),
        new JqueryFormScrollTrait(),
        new BootstrapInitFieldsTrait(),
        new BootstrapInitExternalFieldsTrait()
    ];

    initTraits(this, traits);

    this.alert = function(status, message, callback) {
        if (typeof $.alert !== 'undefined') return $.alert(status, message, callback);

        if (status === 'error') status = 'danger';
        var $alert = $('<div class="alert alert-fixed-top">')
            .addClass('alert-' + status)
            .hide()
            .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
            .append(message)
            .appendTo('body')
            .fadeIn();

        setTimeout(function() {
            $alert.fadeOut(function() {
                this.remove();
                if (callback)callback();
            });
        }, 3000);
    }
}
