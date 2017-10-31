/**
 * Validation for LegalForm
 */
(function($) {
    function LegalFormValidation() {
        this.ractive = null;
        this.el = null;
        this.elWizard = null;

        //Fields for custom validation
        var textFields = 'input[type="text"], input[type="number"], input[type="email"], textarea';
        var stateFields = 'input[type="radio"], input[type="checkbox"], select';

        /**
         * Initialize validation
         *
         * @param {Ractive} ractive
         */
        this.init = function(ractive) {
            this.ractive = ractive;
            this.el = ractive.el;
            this.elWizard = ractive.elWizard;

            this.initDatePicker();
            this.initCustomValidation();
            this.initTextFields();
            this.initStateFields();

            this.initShowTooltip();
            this.initHideTooltipOnBlur();
            this.initHideTooltipOnScroll();

            this.initBootstrapValidation();
            this.initOnStep();
        }

        /**
         * Init validation for date picker
         */
        this.initDatePicker = function () {
            $(this.elWizard).on('dp.change', $.proxy(function(e) {
                var input = $(e.target).find(':input').get(0);
                var name = $(input).attr('name');

                this.validateField(input);
                this.ractive.updateModel(name);
            }, this));
        }

        /**
         * Init custom validation
         */
        this.initCustomValidation = function () {
            $(this.elWizard).on('change', ':input', $.proxy(function(e) {
                this.validateField(e.target);
            }, this));
        }

        /**
         * Launch validation when interacting with text field
         */
        this.initTextFields = function () {
            $(this.elWizard).on('focus keyup', textFields, $.proxy(function(e) {
                this.handleValidation(e.target);
            }, this));
        }

        /**
         * Launch validation when interacting with "state" field
         */
        this.initStateFields = function () {
            $(this.elWizard).on('click', stateFields, $.proxy(function(e) {
                this.handleValidation(e.target);
            }, this));
        }

        /**
         * Init and show tooltips
         */
        this.initShowTooltip = function () {
            $(this.elWizard).on('mouseover click', '[rel=tooltip]', $.proxy(function(e) {
                this.initTooltip(e.target);
            }, this));
        }

        /**
         * Close programaticaly opened tooltip when leaving field
         */
        this.initHideTooltipOnBlur = function() {
            $(this.elWizard).on('blur', textFields + ', ' + stateFields, $.proxy(function(e) {
                var help = $(e.target).closest('.form-group').find('[rel="tooltip"]');
                var tooltip = $(help).data('bs.tooltip');
                if (tooltip && tooltip.$tip.hasClass('in')) $(help).tooltip('hide');
            }, this));
        }

        /**
         * Close programaticaly opened tooltips on form scroll
         */
        this.initHideTooltipOnScroll = function () {
            $(this.elWizard).on('scroll', function(e) {
                $('[rel="tooltip"]').each(function() {
                    var tooltip = $(e.target).data('bs.tooltip');

                    if (tooltip && tooltip.$tip.hasClass('in')) {
                        $(this).tooltip('hide');
                    }
                });
            });
        }

        /**
         * Initialize the bootstrap vaidation for the forms
         */
        this.initBootstrapValidation = function () {
            $(this.elWizard).find('form').validator();
        }

        /**
         * Update the bootstrap vaidation for the forms
         */
        this.updateBootstrapValidation = function () {
            $(this.elWizard).find('form').validator('update');
        }

        /**
         * Initialize validation on step event
         */
        this.initOnStep = function () {
            var ractive = this.ractive;
            var self = this;

            $(this.elWizard).on('step.bs.wizard done.bs.wizard', '', $.proxy(function(e) {
                if (e.direction === 'back' || ractive.get('validation_enabled') === false) return;

                var validator = $(self.el).find('.wizard-step.active form').data('bs.validator');
                validator.validate();

                $(self.el).find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                    self.validateField(this);
                    $(this).change();
                });

                if (validator.isIncomplete() || validator.hasErrors()) {
                    e.preventDefault();
                    return;
                }

                if (e.type === 'done') {
                    $(self.el).trigger('done.completed');
                }
            }));
        };

        /**
         * Launch validation and tooltips
         *
         * @param {Element} input
         */
        this.handleValidation = function(input) {
            var self = this;
            this.validateField(input);

            //This is needed to immediately mark field as invalid on type
            $(input).change();

            var help = $(input).closest('.form-group').find('[rel="tooltip"]');
            if (!$(help).length) return;

            var isValid = $(input).is(':valid');
            var tooltip = $(help).data('bs.tooltip');
            var isShown = tooltip && tooltip.$tip.hasClass('in');

            if (!isValid && !isShown) {
                //Timeout is needed for radio-checkboxes, when both blur and focus can work on same control
                setTimeout(function() {
                    self.initTooltip(help, true);
                }, $(input).is(stateFields) ? 300 : 0);
            } else if (isValid && isShown) {
                $(help).tooltip('hide');
            }
        }

        /**
         * Perform custom field validation
         *
         * @param {Element} input
         */
        this.validateField = function(input) {
            var error = 'Value is not valid';
            var name = $(input).attr('name') ? $(input).attr('name') : $(input).attr('data-id');
            if (!name) return;

            var value = $(input).val();
            if (value.length === 0) {
                $(input).get(0).setCustomValidity(
                    $(input).attr('required') ? 'Field is required' : ''
                );
                return;
            }

            var keypath = name.replace(/\{\{\s*/, '').replace(/\}\}\s*/, '').split('.');
            var meta = this.ractive.get('meta')[keypath[0]];
            name = keypath[0];

            if (keypath.length > 1) {
                for (var i = 1; i < keypath.length; i++) {
                    if (meta) break;

                    meta = meta[keypath[i]];
                    name += '.' + keypath[i];
                }
            }

            if (typeof meta === 'undefined') {
                console && console.warn("No meta for '" + name + "'");
                return;
            }

            // Implement validation for group checkboxes
            if (meta.type === 'group') {
                const checkBoxId = $(input).attr('data-id');
                const allCheckboxes = $("[data-id='" + checkBoxId + "']");
                const isRequired = !$(input).closest('.form-group').find('label > span').length ? false :
                    $(input).closest('.form-group').find('label > span')[0].className === 'required' ? true : false;

                let checked = 0;

                for (var i = 0; i < allCheckboxes.length; i++) {
                    if (allCheckboxes[i].checked) {
                        checked++;
                    } else {
                        $(allCheckboxes[i]).prop('required', false);
                    }
                }

                if (isRequired && checked === 0) {
                    $(input).get(0).setCustomValidity(error);
                    return;
                }
            }

            // Implement validation for numbers
            if (meta.type === 'number') {
                var min = $(input).attr('min');
                var max = $(input).attr('max');
                var valid = $.isNumeric(value) && (!$.isNumeric(min) || Number(value) >= Number(min)) && (!$.isNumeric(max) || Number(value) <= Number(max));
                if (!valid) {
                    $(input).get(0).setCustomValidity(error);
                    return;
                }
            }
            // Implement validation for dates
            if (meta.type === 'date') {
                var valid = moment(value, 'DD-MM-YYYY').isValid();
                if (!valid) {
                    $(input).get(0).setCustomValidity(error);
                    return;
                }
            }

            var validation = meta.validation;

            if ($.trim(validation).length > 0) {
                var validationField = name + '-validation';
                var result = this.ractive.get(validationField.replace(/\./g, '\\.')); //Escape dots, as it is computed field
                if (!result) {
                    $(input).get(0).setCustomValidity(error);
                    return;
                }
            }

            $(input).get(0).setCustomValidity('');
        }

        //Init and show tooltip for the first time
        this.initTooltip = function(element, show) {
            var inited = $(element).data('bs.tooltip');
            if (!inited) {
                $(element).tooltip({
                    placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right',
                    container: 'body'
                });
            }

            if (!inited || show) $(element).tooltip('show');
        }
    }

    window.LegalFormValidation = LegalFormValidation;
})(jQuery);
