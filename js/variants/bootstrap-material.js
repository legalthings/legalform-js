
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapVariant;

    var BootstrapInitTrait = require('./bootstrap/init-trait');
    var BootstrapTooltipTrait = require('./bootstrap/tooltip-trait');
    var BootstrapInitFieldsTrait = require('./bootstrap/init-fields-trait');
    var BootstrapInitExternalFieldsTrait = require('./bootstrap/init-external-fields-trait');
    var BootstrapHelperTrait = require('./bootstrap/helper-trait');
    var BootstrapBuildFormTrait = require('./bootstrap/build-form-trait');
    var BootstrapMaterialOnChangeTrait = require('./bootstrap-material/on-change-trait');
    var BootstrapMaterialBuildFormTrait = require('./bootstrap-material/build-form-trait');

    var initTraits = require('../lib/init-traits');
}

/**
 * Bootstrap-specific implementation of some legalform-js functionality, with material design
 */
function BootstrapMaterialVariant($) {
    var self = this;

    var traits = [
        new BootstrapInitTrait(),
        new BootstrapTooltipTrait(),
        new BootstrapInitFieldsTrait(),
        new BootstrapInitExternalFieldsTrait(),
        new BootstrapHelperTrait(),
        new BootstrapBuildFormTrait(),

        new BootstrapMaterialOnChangeTrait(),
        new BootstrapMaterialBuildFormTrait(),
    ];

    initTraits(this, traits);

    this.setWizard = function(elWizard) {
        this.$elWizard = $(elWizard);
    }
}
