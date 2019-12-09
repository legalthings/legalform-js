/**
 * Validation for LegalForm
 */
(function() {
    function LegalFormValidation(builderOptions) {
        if (typeof builderOptions === 'undefined') builderOptions = {};

        var self = this;

        //Fields for custom validation
        var textFields = 'input[type="text"], input[type="number"], input[type="email"], textarea';
        var stateFields = 'input[type="radio"], input[type="checkbox"], select';

        this.dom = null;
        this.variant = null;
        this.ractive = null;
        this.elBase = null;
        this.elWizard = null;
        this.wizard = null;
        this.disableRequiredFields = !!builderOptions.disableRequiredFields;

        /**
         * Initialize validation
         *
         * @param {Ractive} ractive
         */
        this.init = function(ractive) {
            this.dom = ractive.dom;
            this.variant = new BootstrapVariant();
            this.ractive = ractive;
            this.elBase = ractive.elBase;
            this.elWizard = ractive.elWizard;
            this.wizard = ractive.wizard;

            this.initDatePicker();
            this.initCustomValidation();
            this.initTextFields();
            this.initStateFields();

            this.initShowTooltip();
            this.initHideTooltipOnBlur();
            this.initHideTooltipOnScroll();

            this.initFormValidator();
            this.initOnStep();
            this.initOnDone();
        }

        /**
         * Init validation for date picker
         */
        this.initDatePicker = function () {
            this.elWizard.on('dp.change', function(e) {
                console.log('date changed event');
                var input = this.findOne('input');
                var name = input.attr('name');

                self.validateField(input);
                self.ractive.updateModel(name);
            });
        }

        /**
         * Init custom validation
         */
        this.initCustomValidation = function () {
            this.elWizard.on('change', 'input, select, textarea', function(e) {
                console.log('change field');
                self.validateField(this);
            });
        }

        /**
         * Launch validation when interacting with text field
         */
        this.initTextFields = function () {
            this.elWizard.on('focus keyup', textFields, function(e) {
                console.log('focus keyup field');
                self.handleValidation(this);
            });
        }

        /**
         * Launch validation when interacting with "state" field
         */
        this.initStateFields = function () {
            this.elWizard.on('click', stateFields, function(e) {
                self.handleValidation(this);
            });
        }

        /**
         * Init and show tooltips
         */
        this.initShowTooltip = function () {
            this.elWizard.on('mouseover click', '.help', function(e) {
                self.variant.initTooltip(this.element);
            });
        }

        /**
         * Close programaticaly opened tooltip when leaving field
         */
        this.initHideTooltipOnBlur = function() {
            this.elWizard.on('blur', textFields + ', ' + stateFields, function(e) {
                console.log('hide tooltip on blur');
                var help = this.closest('[data-role="wrapper"]').findOne('.help');

                self.variant.hideTooltip(help.element);
            });
        }

        /**
         * Close programaticaly opened tooltips on form scroll
         */
        this.initHideTooltipOnScroll = function () {
            this.elWizard.on('scroll', function(e) {
                console.log('scroll event');
                var helps = self.elWizard.findAll('.help');

                helps.each(function() {
                    self.variant.hideTooltip(this.element);
                })
            });
        }

        /**
         * Initialize external form validator
         */
        this.initFormValidator = function () {
            var forms = this.elWizard.findAll('form');

            forms.each(function() {
                self.variant.initFormValidator(this.element);
            });
        }

        /**
         * Update external form validator
         */
        this.updateFormValidator = function () {
            var forms = this.elWizard.findAll('form');

            forms.each(function() {
                self.variant.updateFormValidator(this.element);
            });
        }

        /**
         * Initialize validation on step event
         */
        this.initOnStep = function () {
            var ractive = this.ractive;

            $(this.elWizard.element).on('step.bs.wizard', '', function() {
                console.log('!! jquery step');
            });

            this.elWizard.on('step.bs.wizard', function(e) {
                console.log('step');
                if (e.direction === 'back' || ractive.get('validation_enabled') === false) return;

                var stepForm = self.elWizard.findOne('.wizard-step.active form');

                self.variant.updateFormValidator(stepForm.element);
                self.variant.launchFormValidator(stepForm.element);

                stepForm.findAll(':not(.selectize-input)>:input:not(.btn)').each(function() {
                    self.validateField(this.element);
                    field.trigger('change');
                });

                var invalid = self.variant.isFormValidatorInvalid(stepForm.element);
                if (invalid) {
                    e.preventDefault();
                }
            });
        };

        /**
         * Initialize validation on done event
         */
        this.initOnDone = function() {
            var ractive = this.ractive;
            var self = this;

            $(this.elWizard.element).on('done.bs.wizard', '', function() {
                console.log('!! jquery done');
            });

            var body = this.dom.findOne('body');

            body.on('boo', function(e) {
                console.log('body on simple done');
            });

            body.on('click', function(e) {
                console.log('body on simple click');
            });

            this.elWizard.on('boo.foo.baz', function(e) {
                console.log('on simple done');
            });

            this.elWizard.on('click.foo.bar', function(e) {
                console.log('!! own click event');
            });

            // this.elWizard.on('done.bs.wizard', function(e) {
            //     console.log('done extended');
            //     if (ractive.get('validation_enabled') === false) return;

            //     var valid = self.validateAllSteps(self);
            //     valid ? self.elBase.trigger('done.completed') : e.preventDefault();
            // });
        };

        /**
         * Launch validation and tooltips
         *
         * @param {Element} input
         */
        this.handleValidation = function(input) {
            console.log('Handle validation');
            this.validateField(input);

            console.log('Before trigger change');
            input.trigger('change'); //This is needed to immediately mark field as invalid on type

            var help = input.closest('[data-role="wrapper"]').findOne('.help');
            if (!help.element) return;

            var isValid = input.isValid();
            var isTooltipShown = this.variant.isTooltipShown(help.element);

            console.log('Validadity: ', isValid, isTooltipShown);

            if (!isValid && !isTooltipShown) {
                //Timeout is needed for radio-checkboxes, when both blur and focus can work on same control
                setTimeout(function() {
                    self.variant.initTooltip(help.element, true);
                }, input.is(stateFields) ? 300 : 0);
            } else if (isValid && isTooltipShown) {
                this.variant.hideTooltip(help.element);
            }
        }

        /**
         * Perform custom field validation
         *
         * @param {Element} input
         */
        this.validateField = function(input) {
            var error = 'Value is not valid';
            var name = input.attr('name') ? input.attr('name') : input.attr('data-id');
            if (!name) return;

            var value = input.element.value;

            if (value.length === 0) {
                input.setCustomValidity(
                    input.attr('required') ? 'Field is required' : ''
                );

                return;
            }

            var data = this.getFieldData(name);
            var meta = data.meta;
            name = data.name;

            if (!meta) {
                console && console.warn("No meta for '" + name + "'");
                return;
            }

            // Implement validation for group checkboxes
            if (meta.type === 'group' && input.attr('multiple')) {
                var checkBoxId = input.attr('data-id');
                var allCheckboxes = this.elWizard.findAll('[data-id="' + checkBoxId + '"]');

                var requiredLabel = input.closest('[data-role="wrapper"]').findOne('label > span.required');
                var isRequired = requiredLabel.hasClass('required');

                if (isRequired && this.disableRequiredFields) {
                    allCheckboxes.prop('required', false);
                } else {
                    var checked = 0;
                    allCheckboxes.each(function(item) {
                        if (item.element.checked) checked++;
                    });

                    if (isRequired) allCheckboxes.prop('required', !checked);

                    if (isRequired && checked === 0) {
                        input.setCustomValidity(error);
                        return;
                    }
                }
            }

            // Implement validation for numbers
            if (meta.type === 'number') {
                var number = parseNumber(value);
                var min = parseNumber(input.attr('min'));
                var max = parseNumber(input.attr('max'));

                var valid = number !== null && (min === null || number >= min) && (max === null || number <= max);
                if (!valid) {
                    console.log('--- set min not valid');
                    input.setCustomValidity(error);
                    return;
                }
            }

            // Implement validation for dates
            if (meta.type === 'date') {
                var yearly = !!input.attr('yearly');
                var date = moment(value, yearly ? 'DD-MM' : 'DD-MM-YYYY', true);
                var minDate = moment(input.attr('min_date'), 'DD-MM-YYYY', true);
                var maxDate = moment(input.attr('max_date'), 'DD-MM-YYYY', true);
                var valid = date.isValid();

                if (valid && minDate.isValid()) {
                    valid = date.isSameOrAfter(minDate, 'day');
                }

                if (valid && maxDate.isValid()) {
                    valid = date.isSameOrBefore(maxDate, 'day');
                }

                if (!valid) {
                    input.setCustomValidity(error);
                    return;
                }
            }

            var validation = meta.validation;

            if (typeof validation !== 'undefined' && validation.trim().length > 0) {
                var validationField = name + '-validation';
                var result = this.ractive.get(validationField.replace(/\./g, '\\.')); //Escape dots, as it is computed field

                if (!result) {
                    input.setCustomValidity(error);
                    return;
                }
            }

            input.setCustomValidity('');
        }

        //Get meta and real name for field
        this.getFieldData = function(name) {
            var keypath = name.replace(/\{\{\s*/, '').replace(/\}\}\s*/, '').replace('[', '.').replace(']', '').split('.');
            var meta = this.ractive.get('meta')[keypath[0]];
            name = keypath[0];

            // if we have a fieldgroup with dots, set the name and set meta to the correct fieldpath
            if (keypath.length > 1) {
                for (var i = 1; i < keypath.length; i++) {
                    var key = keypath[i];
                    if (typeof meta[key] === 'undefined') continue;

                    meta = meta[key];
                    name += '.' + key;
                }
            }

            //Just in case, if there is no meta for given field, so we obtained it incorrectly
            if (!meta || typeof meta.type === 'undefined') meta = null;

            return {meta: meta, name: name};
        }

        //Validate all steps on done event
        this.validateAllSteps = function() {
            var toIndex = null;

            this.elWizard.findAll('.wizard-step form').each(function(step, key) {
                self.variant.updateFormValidator(this);
                self.variant.launchFormValidator(this);

                this.findAll(':not(.selectize-input)>:input:not(.btn)').each(function(field) {
                    validation.validateField(this);
                    field.trigger('change');
                });

                var invalid = self.variant.isFormValidatorInvalid(this);
                if (invalid) {
                    toIndex = key;
                    return false;
                }
            });

            if (toIndex === null) return true;

            this.wizard.toStep(toIndex + 1);
            this.variant.updateFormScroll();

            return false;
        }
    }

    window.LegalFormValidation = LegalFormValidation;
})();
