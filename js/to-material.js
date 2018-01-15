/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
(function($) {
    $.fn.toMaterial = function() {
        var $docWizard = $(this);

        // Add class to the material design to prevent another styles for it.

        if ($docWizard.attr('class').indexOf('wizard-step') === -1) {
            $docWizard.addClass('material');
        }

        // Do all labels floating for nice view
        $docWizard.find('.form-group').addClass('bmd-form-group');
        $docWizard.find('.form-group > label').addClass('form-control-label bmd-label-static');

        // Make all inputs a form control
        $docWizard.find('.form-group > input').addClass('form-control');
        $docWizard.find('.selectize-input > input').addClass('form-control');

        // Added prev-next button to the each step
        var $wizardSteps = $docWizard.find('.wizard-step');

        $wizardSteps.each(function(index, value) {
            if (!$(this).children('.wizzard-form').length) {
                var $wizardForm = $('<div>').appendTo(this);
                $wizardForm.addClass('wizzard-form');
                $wizardForm.append($(this).find('form'));
                $wizardForm.append($(this).find('.wizards-actions'));
            }
        });

        // Change checkboxes to the bootstrap material
        $docWizard.find('.form-group .option').each(function() {
            var $div = $(this);
            var type = 'radio';
            $div.addClass($div.find('input').attr('type'));
            $div.find('input').prependTo($div.find('label'));
        });

        // Change likert-view on bootstrap material
        $docWizard.find('.likert-answer').each(function(){
            if (!$(this).children('.radio').length) {
                var $div = $('<div>').appendTo(this).addClass('radio');
                var $label = $('<label>').appendTo($div);
                $(this).find('input').appendTo($label);
            }
        });

        // Add bootstrap material checkbox buttons to option lists that are shown on condition
        $docWizard.find('.checkbox > label').each(function() {
            const input = $(this);

            if (input.length > 0 && !input.find('.checkbox-decorator').length) {
                const text = input.text();
                var outerCircle = $('<span class="bmd-radio-outer-circle"></span>');
                var cbElement = $('<span class="checkbox-decorator"><span class="check"></span></span>');
                $(this).prepend(cbElement);
            }
        });

        // Add bootstrap material radio buttons to option lists that are shown on condition
        $docWizard.find('.radio > label').each(function(){
            if($(this).children('.bmd-radio-outer-circle').length > 1) {
                $(this).children('.bmd-radio-outer-circle').get(0).remove();
                $(this).children('.bmd-radio-inner-circle').get(0).remove();
            }
            if(!$(this).children('.bmd-radio-outer-circle').length) {
                var outerCircle = $('<span class="bmd-radio-outer-circle"></span>');
                var innerCircle = $('<span class="bmd-radio-inner-circle"></span>');
                $(this).prepend(innerCircle);
                $(this).prepend(outerCircle);
            }
        });

        $docWizard.bootstrapMaterialDesign({ autofill: false });
    };
})(jQuery);
