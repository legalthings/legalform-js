
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapVariant;

    var BootstrapInitTrait = require('./bootstrap/init-trait');
    var BootstrapOnChangeTrait = require('./bootstrap/on-change-trait');
    var BootstrapTooltipTrait = require('./bootstrap/tooltip-trait');
    var BootstrapValidatorTrait = require('./bootstrap/validator-trait');
    var JqueryFormScrollTrait = require('./bootstrap/form-scroll-trait');
    var BootstrapInitFieldsTrait = require('./bootstrap/init-fields-trait');
    var BootstrapInitExternalFieldsTrait = require('./bootstrap/init-external-fields-trait');
    var BootstrapHelperTrait = require('./bootstrap/helper-trait');
    var BootstrapBuildFormTrait = require('./bootstrap/build-form-trait');

    var initTraits = require('../lib/init-traits');
}

/**
 * Bootstrap-specific implementation of some legalform-js functionality
 */
function BootstrapVariant($, elWizard) {
    var self = this;

    var traits = [
        new BootstrapInitTrait(),
        new BootstrapOnChangeTrait(),
        new BootstrapTooltipTrait(),
        new BootstrapValidatorTrait(),
        new JqueryFormScrollTrait(),
        new BootstrapInitFieldsTrait(),
        new BootstrapInitExternalFieldsTrait(),
        new BootstrapHelperTrait(),
        new BootstrapBuildFormTrait()
    ];

    initTraits(this, traits);

    this.$elWizard = $(elWizard);
}
