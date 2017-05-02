/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
$.fn.toMaterial = function() {
    var $docWizard = $(this);

    // Disable input mask on hover for material design
    Inputmask.prototype.defaults.showMaskOnHover = false;

    // Add class to the material design to prevent another styles for it.
    $docWizard.addClass('material');

    // Fix select without material
    $docWizard.find('select').removeClass('form-control');
    $docWizard.find('select').parent().addClass('is-empty');

    // Added prev-next button to the each step
    var $wizardSteps = $docWizard.find('.wizard-step');

    $wizardSteps.each(function(index, value) {
        var $wizardForm = $('<div>').appendTo(this);
        $wizardForm.addClass('wizzard-form');
        $wizardForm.append($(this).find('form'));
        $wizardForm.append($(this).find('.wizards-actions'));
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
        var $div = $('<div>').appendTo(this).addClass('radio');
        var $label = $('<label>').appendTo($div);
        $(this).find('input').appendTo($label);
    });

    // Do all labels floating for nice view
    $docWizard.find('.form-group').addClass('label-floating');
    $docWizard.find('.form-group > label').addClass('control-label');

    if ($.material) {
        $.material.init();
    }
};
