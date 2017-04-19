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

    // Move step name on the top and create links for it
    $docWizard.find('h3').each(function(){$(this).prependTo($(this).parent().parent())});

    // Fix select without material
    $docWizard.find('select').removeClass('form-control');

    // Added prev-next button to the each step
    var buttons = ['#wizard-prev', '#wizard-next', '#wizard-done'];
    var $wizardSteps = $docWizard.find('.wizard-step');
    var $wizardActions = $(buttons.join(', '));

    $wizardSteps.each(function(index, value) {
        var $wizardForm = $('<div>').appendTo(this);
        $wizardForm.addClass('wizzard-form');
        $wizardForm.append($(this).find('form'));
        var $wizardActions = $('<div>').addClass('wizard-actions').appendTo($wizardForm);

        //We add all the buttons to each step. When next/prev step is shown or hidden, sometimes it is needed to show/hide buttons of current step
        //For ex. if now there is no next step at all, for current step 'next' button is hidden and 'done' button is shown
        for (var i = 0; i < buttons.length; i++) {
            $wizardActions.append($(buttons[i]).clone().css('display', '').removeAttr('id'));
        }
    });

    $wizardActions.hide();

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
};
