function WizardTrait($, jmespath) {
    /**
     * Initialize the Bootstrap wizard
     */
    this.initWizard = function () {
        this.elWizard = $(this.el).find('.wizard').addBack('.wizard')[0];

        this.initWizardJumpBySteps();
        this.initWizardTooltip();
        this.initWizardOnStepped();

        if (this.validation) {
            this.validation.init(this);
        }

        $(this.elWizard).wizard('refresh');
        this.stepCount = $(this.elWizard).find('.wizard-step').length;
    };

    /**
     * Jump to a step by clicking on a header
     */
    this.initWizardJumpBySteps = function () {
        var ractive = this;

        $(this.elWizard).on('click', '.wizard-step > h3', function(e) {
            e.preventDefault();

            var $toStep = $(this).closest('.wizard-step');
            var index = $(ractive.el).find('.wizard-step').index($toStep);

            $(ractive.el).find('.wizard-step form').each(function(key, step) {
                if (key >= index) return false;

                var $stepForm = $(this);
                var validator = $stepForm.data('bs.validator');

                if (!validator) {
                    self.initBootstrapValidation();
                    self.updateBootstrapValidation();
                    return;
                }

                validator.update();
                validator.validate();

                $stepForm.find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                    ractive.validation.validateField(this);
                    $(this).change();
                });

                var invalid = (validator.isIncomplete() || validator.hasErrors()) && index > key;
                if (invalid) {
                    index = key;
                    return false;
                }
            });

            $(ractive.elWizard).wizard(index + 1);
            $('.form-scrollable').perfectScrollbar('update');
        });
    };

    /**
     * Enable tooltips for the wizard
     */
    this.initWizardTooltip = function () {
        $(this.elWizard).on('mouseover click', '[rel=tooltip]', function() {
            if (!$(this).data('bs.tooltip')) {
                $(this).tooltip({ placement: 'left', container: 'body'});
                $(this).tooltip('show');
            }
        });
    };

    /**
     * Initialize the event handle to move to a step on click
     */
    this.initWizardOnStepped = function () {
        var elWizard = this.elWizard;

        $(elWizard).on('stepped.bs.wizard done.bs.wizard', '', function() {
            var article = $(this).find('.wizard-step.active').data('article');
            var $scrollElement = false;
            if (article && article === 'top') {
                $scrollElement = $('#doc');
            } else if (article && $('.article[data-reference="' + article + '"]').length){
                $scrollElement = $('.article[data-reference="' + article + '"]');
            }
            if ($scrollElement && $scrollElement.scrollTo) {
                $scrollElement.scrollTo()
            }

            $('#doc-help .help-step').hide();

            var step = $(elWizard).children('.wizard-step.active').index();
            $('#doc-help').children('.help-step').eq(step).show();
            $('#doc-sidebar ol').children('li').eq(step).addClass('active');

            // Scroll form to active step
            // TODO: Please determine the offset dynamically somehow
            var offset = $('.navbar-header').is(':visible')
                ? $('.navbar-header').height()
                : (($('#doc-preview-switch-container').outerHeight() || 0) + 15);
            var offsetH1 = $('h1.template-name').outerHeight();

            var pos = $(".wizard-step.active").position().top;
            var padding = -30;

            $('#doc-form').scrollTop(pos + offset + offsetH1 + padding);
            $('.form-scrollable').perfectScrollbar('update');
        });
    };

    /**
     * Rebuild the wizard
     */
    this.rebuildWizard = function () {
        if (!this.elWizard || $(this.elWizard).find('.wizard-step').length === this.stepCount) return;

        $(this.elWizard).wizard('refresh');
        this.stepCount = $(this.el).find('.wizard-step').length;

        if (this.validation) this.validation.initBootstrapValidation();
    };
}
