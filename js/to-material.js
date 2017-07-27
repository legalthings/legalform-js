/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
(function($) { 
    $.fn.toMaterial = function() {
        var $docWizard = $(this);
        
        // Add class to the material design to prevent another styles for it.
        $docWizard.addClass('material');

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

        // Do all labels floating for nice view
        $docWizard.find('.form-group').addClass('label-floating');
        $docWizard.find('.form-group > label').addClass('control-label');

        if ($.material) {
            $.material.init();
        }
    };
})(jQuery);
