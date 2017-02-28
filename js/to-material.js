/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
$.fn.toMaterial = function() {
    var $docWizard = $(this);

    //Move step name on the top and create links for it
    $docWizard.find('h3').each(function(){$(this).prependTo($(this).parent().parent())});

    //Added prev-next button to the each step
    var $wizardSteps = $docWizard.find('.wizard-step');
    $wizardSteps.each(function(index, value) {
        var $wizardActions = $('<div>').addClass('wizard-actions').appendTo($(this).find('form'));

        if (index !== 0 ) {
            $wizardActions.append($('#wizard-prev').clone().removeAttr('id'));
        }
        if (index !== $wizardSteps.length - 1) {
            $wizardActions.append($('#wizard-next').clone().removeAttr('id'));
        }
        if (index === $wizardSteps.length - 1 ) {
            $wizardActions.append($('#wizard-done').clone().removeAttr('id'));
        }
    });

    /** Change checkboxes to the bootstrap material **/
    $docWizard.find('.form-group .option').each(function(){
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

    //change all selects to the selectize
    $docWizard.find('select').selectize();

    //Do all labels floating for nice view
    $docWizard.find('.form-group').addClass('label-floating');
    $docWizard.find('.form-group > label').addClass('control-label');

    //Init material inputs
    $.material.init();
};
