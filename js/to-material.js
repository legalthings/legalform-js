/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
$.fn.toMaterial = function() {
    var $docWizard = $(this);

    //Disable input mask on hover for material design
    Inputmask.prototype.defaults.showMaskOnHover = false;

    //Add class to the material design to prevent another styles for it.
    $docWizard.addClass('material');
    
    //Move step name on the top and create links for it
    $docWizard.find('h3').each(function(){$(this).prependTo($(this).parent().parent())});
    
    //Added prev-next button to the each step
    var $wizardSteps = $docWizard.find('.wizard-step');
    var $wizardActions = $('#wizard-prev, #wizard-next, #wizard-done');
    $wizardSteps.each(function(index, value) {
        var $wizardForm = $('<div>').appendTo(this);
            $wizardForm.addClass('wizzard-form');
            $wizardForm.append($(this).find('form'));
        var $wizardActions = $('<div>').addClass('wizard-actions').appendTo($wizardForm);
        console.log($wizardActions); 
        if (index != 0 ) {
            $wizardActions.append($('#wizard-prev').clone().removeAttr('id'));
        }
        if (index != $wizardSteps.length - 1) {
            $wizardActions.append($('#wizard-next').clone().removeAttr('id'));
        }
        if (index == $wizardSteps.length - 1 ) {
            $wizardActions.append($('#wizard-done').clone().removeAttr('id'));
        }
    });
    $wizardActions.hide();

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

    //change all selects to the selectize + fix not changed value on select
    $docWizard.find('select').selectize({
      onDropdownClose: function(dropdown) {
        if ($(dropdown).parent().prev().text() != '') {
            $(dropdown).parent().parent().removeClass('is-empty');
        }
      }
    });

    //Do all labels floating for nice view
    $docWizard.find('.form-group').addClass('label-floating');
    $docWizard.find('.form-group > label').addClass('control-label');

    //Init material inputs
    $.material.init();
};
