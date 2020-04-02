
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaOnChangeTrait;
}

/**
 * Launch some actions on wizard form change
 */
function BulmaOnChangeTrait() {
    this.onChange = function() {

    }

    this.onDateChange = function(callback) {
        this.elWizard.on('dp.change', function(e) {
            callback(this);
        });
    }
}
