
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapVariant;

    var BootstrapTooltipTrait = require('./bootstrap/tooltip-trait');
    var BootstrapValidatorTrait = require('./bootstrap/validator-trait');
    var JqueryFormScrollTrait = require('./bootstrap/form-scroll-trait');
    var BootstrapInitFieldsTrait = require('./bootstrap/init-fields-trait');
    var BootstrapInitExternalFieldsTrait = require('./bootstrap/init-external-fields-trait');
    var BootstrapBuildFormTrait = require('./bootstrap/build-form-trait');

    var initTraits = require('../lib/init-traits');
}

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
        new BootstrapInitExternalFieldsTrait(),
        new BootstrapBuildFormTrait()
    ];

    initTraits(this, traits);

    this.init = function() {
        // disable inputmask jquery ui
        $(document).off('.inputmask.data-api');
    }

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
