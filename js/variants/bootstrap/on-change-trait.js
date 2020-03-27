
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapOnChangeTrait;
}

/**
 * Launch some actions on wizard form change
 */
function BootstrapOnChangeTrait() {
    this.onChange = function() {

    }

    this.onDateChange = function(callback) {
        $(document).on('dp.change', function(e) {
            const input = $(e.target).find('input');

            callback(input[0]);
        })
    }
}
