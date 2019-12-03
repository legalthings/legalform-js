/**
 * Validation for LegalForm
 */
(function() {
    function LegalFormValidation(builderOptions, variant) {
        if (typeof builderOptions === 'undefined') builderOptions = {};

        var self = this;

        //Fields for custom validation
        var textFields = 'input[type="text"], input[type="number"], input[type="email"], textarea';
        var stateFields = 'input[type="radio"], input[type="checkbox"], select';

        this.dom = new Dom();
        this.variant = variant;
        this.ractive = null;
        this.el = null;
        this.elWizard = null;
        this.wizard = null;
        this.disableRequiredFields = !!builderOptions.disableRequiredFields;

        /**
         * Initialize validation
         *
         * @param {Ractive} ractive
         */
        this.init = function(ractive) {
            this.ractive = ractive;
            this.el = new DomElement(ractive.el);
            this.elWizard = new DomElement(ractive.elWizard);
            this.wizard = new FormWizard(this.elWizard);

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
                var target = new DomElement(e.target);
                var input = target.findOne('input');
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
                self.validateField(e.target);
            });
        }

        /**
         * Launch validation when interacting with text field
         */
        this.initTextFields = function () {
            this.elWizard.on('focus keyup', textFields, function(e) {
                self.handleValidation(e.target);
            });
        }

        /**
         * Launch validation when interacting with "state" field
         */
        this.initStateFields = function () {
            this.elWizard.on('click', stateFields, function(e) {
                self.handleValidation(e.target);
            });
        }

        /**
         * Init and show tooltips
         */
        this.initShowTooltip = function () {
            this.elWizard.on('mouseover click', '[rel=tooltip]', function(e) {
                self.variant.initTooltip(e.target);
            });
        }

        /**
         * Close programaticaly opened tooltip when leaving field
         */
        this.initHideTooltipOnBlur = function() {
            this.elWizard.on('blur', textFields + ', ' + stateFields, function(e) {
                var target = new DomElement(e.target);
                var help = target.closest('[data-role="wrapper"]').findOne('.help');

                self.variant.hideTooltip(help);
            });
        }

        /**
         * Close programaticaly opened tooltips on form scroll
         */
        this.initHideTooltipOnScroll = function () {
            this.elWizard.on('scroll', function(e) {
                var helps = self.elWizard.findAll('.help');

                helps.each(function() {
                    self.variant.hideTooltip(this);
                })
            });
        }

        /**
         * Initialize external form validator
         */
        this.initFormValidator = function () {
            var forms = this.elWizard.findAll('form');

            this.variant.initFormValidator(forms.list);
        }

        /**
         * Update external form validator
         */
        this.updateFormValidator = function () {
            var forms = this.elWizard.findAll('form');

            this.variant.updateFormValidator(forms.list);
        }

        /**
         * Initialize validation on step event
         */
        this.initOnStep = function () {
            var ractive = this.ractive;

            this.elWizard.on('step.bs.wizard', function(e) {
                if (e.direction === 'back' || ractive.get('validation_enabled') === false) return;

                var stepForm = self.el.findOne('.wizard-step.active form');

                self.variant.updateFormValidator(stepForm.element);
                self.variant.launchFormValidator(stepForm.element);

                stepForm.findAll(':not(.selectize-input)>:input:not(.btn)').each(function(field) {
                    validation.validateField(this);
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

            this.elWizard.on('done.bs.wizard', function(e) {
                if (ractive.get('validation_enabled') === false) return;

                var valid = validateAllSteps(self);
                valid ? self.el.trigger('done.completed') : e.preventDefault();
            });
        };

        /**
         * Launch validation and tooltips
         *
         * @param {Element} input
         */
        this.handleValidation = function(input) {
            this.validateField(input);

            input = new DomElement(input);
            input.trigger('change'); //This is needed to immediately mark field as invalid on type

            var help = input.closest('[data-role="wrapper"]').findOne('.help');
            if (!help.element) return;

            var isValid = input.isValid();
            var isTooltipShown = this.variant.isTooltipShown(help.element);

            if (!isValid && !isTooltipShown) {
                //Timeout is needed for radio-checkboxes, when both blur and focus can work on same control
                setTimeout(function() {
                    self.variant.initTooltip(help.element, true);
                }, input.is(stateFields) ? 300 : 0);
            } else if (isValid && isTooltipShown) {
                this.variant.hideTooltip(help);
            }
        }

        /**
         * Perform custom field validation
         *
         * @param {Element} input
         */
        this.validateField = function(input) {
            input = new DomElement(input);

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
                var allCheckboxes = this.dom.findAll('[data-id="' + checkBoxId + '"]');

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
