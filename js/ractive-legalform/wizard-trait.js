function WizardTrait() {
    /**
     * Initialize the Bootstrap wizard
     */
    this.initWizard = function () {
        this.wizard = new FormWizard(this.elWizard);

        this.initWizardJumpBySteps();
        this.initWizardOnStepped();

        if (this.validation) {
            this.validation.init(this);
        }

        this.wizard.refresh();
        this.stepCount = this.elWizard.findAll('.wizard-step').length();
    };

    /**
     * Jump to a step by clicking on a header
     */
    this.initWizardJumpBySteps = function () {
        var ractive = this;

        this.elWizard.on('click', '.wizard-step > h3', function(e) {
            e.preventDefault();

            var toStep = this.closest('.wizard-step');
            var index = ractive.elWizard.findAll('.wizard-step').index(toStep);

            ractive.elWizard.findAll('.wizard-step form').each(function(key) {
                if (key >= index) return false;

                var stepForm = this;
                var validator = ractive.validation.getFormValidator(this);

                if (!validator) {
                    ractive.validation.initFormValidator(stepForm);
                    ractive.validation.updateFormValidator(stepForm);
                    return;
                }

                var invalid = !ractive.validation.validateForm(stepForm) && index > key;
                if (invalid) {
                    index = key;
                    return false;
                }
            });

            ractive.wizard.show(index + 1);
            ractive.updateFormScroll();
        });
    };

    /**
     * Initialize the event handle to move to a step on click
     */
    this.initWizardOnStepped = function () {
        var ractive = this;

        this.elWizard.on('stepped.wizard done.wizard', function() {
            var article = this.findOne('.wizard-step.active').attr('data-article');
            var scrollElement = null;

            if (article === 'top') {
                scrollElement = ractive.dom.findOne('#doc');
            } else if (article){
                var target = ractive.dom.findOne('.article[data-reference="' + article + '"]');

                if (target.element) scrollElement = target;
            }

            var helpSteps = ractive.dom.findAll('#doc-help .help-step');
            var activeStep = ractive.elWizard.findOne('.wizard-step.active');
            var stepIdx = activeStep.index();

            helpSteps.each(function() {
                this.hide();
            });

            helpSteps.get(stepIdx).show();
            ractive.dom.findOne('#doc-sidebar ol').children('li').get(stepIdx).addClass('active');

            // Scroll form to active step
            // TODO: Please determine the offset dynamically somehow
            var header = ractive.dom.findOne('.navbar-header');
            var previewSwitch = ractive.dom.findOne('#doc-preview-switch-container');

            var offset = header.isVisible()
                ? header.height()
                : ((previewSwitch.outerHeight() || 0) + 15);
            var offsetH1 = ractive.dom.findOne('h1.template-name').outerHeight();

            var pos = activeStep.position().top;
            var padding = -30;

            ractive.dom.findOne('#doc-form').scrollTop(pos + offset + offsetH1 + padding);

            ractive.updateFormScroll();
        });
    };

    /**
     * Rebuild the wizard
     */
    this.rebuildWizard = function () {
        var steps = null;
        var skip =
            !this.elWizard.element ||
            !this.wizard ||
            ((steps = this.elWizard.findAll('.wizard-step')) && steps.length() === this.stepCount);

        if (skip) return;

        this.wizard.refresh();
        this.stepCount = steps.length();

        if (this.validation) this.validation.initAllFormsValidators();
    };
}
