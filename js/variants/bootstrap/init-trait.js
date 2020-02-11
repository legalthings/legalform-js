
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapInitTrait;
}

/**
 * Init variant
 */
function BootstrapInitTrait() {
    this.init = function() {
        // disable inputmask jquery ui
        $(document).off('.inputmask.data-api');
    }
}
