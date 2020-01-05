
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaVariant;

    var BulmaInitTrait = require('./bulma/init-trait');
    var BulmaOnChangeTrait = require('./bulma/on-change-trait');
    var BulmaTooltipTrait = require('./bulma/tooltip-trait');
    var BulmaInitFieldsTrait = require('./bulma/init-fields-trait');
    var BulmaInitExternalFieldsTrait = require('./bulma/init-external-fields-trait');
    var BulmaHelperTrait = require('./bulma/helper-trait');
    var BulmaBuildFormTrait = require('./bulma/build-form-trait');

    var initTraits = require('../lib/init-traits');
}

/**
 * Bulma-specific implementation of some legalform-js functionality
 */
function BulmaVariant() {
    var self = this;

    var traits = [
        new BulmaInitTrait(),
        new BulmaOnChangeTrait(),
        new BulmaTooltipTrait(),
        new BulmaInitFieldsTrait(),
        new BulmaInitExternalFieldsTrait(),
        new BulmaHelperTrait(),
        new BulmaBuildFormTrait()
    ];

    initTraits(this, traits);

    this.setWizard = function(elWizard) {
        this.elWizard = new DomElement(elWizard);
    }

}
