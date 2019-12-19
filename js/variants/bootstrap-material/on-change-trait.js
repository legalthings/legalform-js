
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapMaterialOnChangeTrait;
}

/**
 * Launch some actions on wizard form change
 */
function BootstrapMaterialOnChangeTrait() {
    this.onChange = function() {
        if (!this.$elWizard.hasClass('material')) {
            this.$elWizard.addClass('material');
        }

        this.$elWizard.find('.selectize-input > input').addClass('form-control');

        // Add bootstrap material radio buttons to option lists that are shown on condition
        this.$elWizard.find('.radio > label').each(function(){
            if($(this).children('.bmd-radio-outer-circle').length > 1) {
                $(this).children('.bmd-radio-outer-circle').get(0).remove();
                $(this).children('.bmd-radio-inner-circle').get(0).remove();
            }

            if(!$(this).children('.bmd-radio-outer-circle').length) {
                var outerCircle = $('<span class="bmd-radio-outer-circle"></span>');
                var innerCircle = $('<span class="bmd-radio-inner-circle"></span>');
                $(this).append(innerCircle);
                $(this).append(outerCircle);
            }
        });

        this.$elWizard.bootstrapMaterialDesign({ autofill: false });
    }
}
