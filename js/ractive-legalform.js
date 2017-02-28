(function($, Ractive, jmespath) {
    window.RactiveLegalForm = Ractive.extend({
        /**
         * Number of steps in the wizard
         */
        stepCount: null,

        
        /**
         * Called by Ractive on initialize
         */
        init: function(options) {
            this.initLegalForm(options);
        },

        /**
         * Initialize Ractive for LegalForm
         */
        initLegalForm: function(options) {
            if (options.locale) {
                this.locale = options.locale;
            }

            this.set(getValuesFromOptions(options));

            metaRecursive(options.meta, $.proxy(this.initField, this));
            this.initConditions(options);

            this.observe('*', $.proxy(this.onChangeLegalForm, this), {defer: true});
        },

        /**
         * Initialize special field types
         */
        initField: function (key, meta) {
            if (meta.type === 'amount') {
                this.initAmountField(key, meta);
            } else if (meta.type === 'external_data') {
                this.initExternalData($.extend({name: key}, meta));
            }
        },

        /**
         * Set toString method for amount value, which add the currency.
         *
         * @param {string} key
         * @param {object} meta
         */
        initAmountField: function (key, meta) {
            var amount = this.get(key);

            if (amount) {
                amount.toString = function () {
                    return this.amount !== '' ? this.amount + ' ' + this.unit : '';
                };

                this.update(key);
            }
        },

        /**
         * Observe and apply conditions.
         */
        initConditions: function(options) {
            var conditions = '';
            var conditionsFields = {};
            var suffix = '-conditions';

            // Gather all computed conditions
            metaRecursive(options.meta, function (key, meta) {
                if (meta.conditions_field) {
                    conditions += meta.conditions_field + ' ';
                    conditionsFields[meta.conditions_field] = meta;
                }
            });

            // Set field value to null if condition is not true
            if (conditions) {
                this.observe(conditions, $.proxy(function (newValue, oldValue, keypath) {
                    var name = keypath.replace(suffix, '');
                    var input = '#doc-wizard input[name="' + name + '"]';

                    if (!newValue && oldValue !== undefined) {
                        this.set(name, '');
                    } else {
                        var rebuild = (conditionsFields[keypath].external_source) && !$(input).hasClass('selectized');
                        if (rebuild) this.initExternalSourceUrl(input);
                    }
                }, this), {defer: true});
            }
        },

        /**
         * Use jQuery Inputmask rather than Jasny Bootstrap inputmask
         */
        initInputmask: function() {
            if (typeof window.Inputmask === 'undefined') {
                return;
            }

            var ractive = this;
            var Inputmask = window.Inputmask;

            // disable inputmask jquery ui
            $(document).off('.inputmask.data-api');
            
            //Add jquery inputmask from Robin Herbots
            this.observe('*', function() {
                $('input[data-mask]').each(function () {
                    var $origin = $(this);
                    var name = $origin.attr('name');
                    var mask = $origin.data('mask');

                    if ($origin.data('masked')) return; // Mask already applied

                    Inputmask(mask).mask($origin);
                    $origin.on('focusout', function(){
                       ractive.set(name, this.value);
                    });

                    $origin.data('masked', true);
                });
            }, {defer: true});
        },

        /**
         * Callback for any kind of change.
         * Applies logic to the LegalForm.
         *
         * @param          newValue (not used)
         * @param          oldValue (not used)
         * @param {string} keypath
         */
        onChangeLegalForm: function (newValue, oldValue, keypath) {
            // Ignore changes to computed conditions
            var conditionsSuffix = '-conditions';
            if (keypath.indexOf(conditionsSuffix) === keypath.length - conditionsSuffix.length) {
                return;
            }

            this.updateNumberWithUnit(keypath);

            setTimeout(this.rebuildWizard, 200);
            setTimeout(this.refreshLikerts, 0);
        },
        
        /**
         * Update the options for number with unit
         *
         * @param string keypath
         */
        updateNumberWithUnit: function (keypath) {
            var suffix = '.amount';
            
            if (keypath.indexOf(suffix) !== keypath.length - suffix.length) {
                return;
            }

            var key = keypath.replace(/\.amount$/, '');
            var oldOptions = this.get('meta.' + key + '.' + (newValue == 1 ? 'plural' : 'singular'));
            var newOptions = this.get('meta.' + key + '.' + (newValue == 1 ? 'singular' : 'plural'));
            var index = oldOptions ? oldOptions.indexOf(this.get(key + '.unit')) : -1;

            if (newOptions && index !== -1) this.set(key + '.unit', newOptions[index]);
        },

        /**
         * Show / hide likert questions
         */
        refreshLikerts: function () {
            $(this.el).find('.likert').each(function() {
                var likert = this;
                $(this).find('.likert-question').each(function(index) {
                    var empty = $(this).text() === '';
                    $(this).closest('tr')[empty ? 'hide' : 'show']();
                    if (index === 0) {
                        $(likert).parent()[empty ? 'hide' : 'show']();
                    }
                });
            });
        },

        /**
         * Rebuild the wizard
         */
        rebuildWizard: function () {
            if ($(this.el).find('.wizard-step').length === this.stepCount) return;

            $(this.el).wizard('refresh');
            this.stepCount = $(this.el).find('.wizard-step').length;
            $(this.el).find('form').validator();
        },


        /**
         * Method that is called when Ractive is complete
         */
        complete: function () {
            this.completeLegalForm();
        },

        /**
         * Apply complete for LegalForm
         */
        completeLegalForm: function () {
            this.handleChangeDropdown();
            this.handleChangeDate();
            this.initSelectize();

            this.initWizard();
            this.initValidation();
            
            $('#doc-form').perfectScrollbar();

            this.initPreviewSwitch();

            this.initValidation();

            this.refreshLikerts();
            this.initExternalSourceUrl($(this.el).find('input[external_source="true"]'));
        },

        /**
         * Handle selecting a value through the dropdown
         */
        handleChangeDropdown: function () {
            $('#doc-form').on('click', '.dropdown-select a', function() {
                ractive.set($(this).closest('.dropdown-select').data('name'), $(this).text());
            });
        },

        /**
         * Handle picking a date using the date picker
         */
        handleChangeDate: function () {
            var ractive = this;
            
            $('#doc-form').on('dp.change', function(e) {
                var input = $(e.target).find(':input').get(0);
                var name = $(input).attr('name');

                ractive.updateModel(name);

                //Fix material design
                $(e.target).parent().removeClass('is-empty');
            });
        },

        /**
         * Change all selects to the selectize
         */
        initSelectize: function () {
            var ractive = this;

            $(this.el).find('select').each(function() {
                var $select = $(this);
                $select.selectize({
                    create: false,
                    onDropdownClose: function($dropdown) {
                        var value = ractive.get($select.attr('name'));

                        if (value !== '' && value !== null) {
                            $dropdown.parent().parent().removeClass('is-empty');
                        }
                    },
                    onChange: function(value) {
                        ractive.set($select.attr('name'), value);
                    }
                });
            });
        },

        /**
         * Initialize the Bootstrap wizard
         */
        initWizard: function () {
            this.initWizardJumpBySteps();
            this.initWizardTooltip();
            this.initWizardOnStepped();
            
            $(this.el).wizard('refresh');
            $(this.el).find('form').validator();
            $('#doc-form').perfectScrollbar();
        },

        /**
         * Jump to a step by clicking on a header
         */
        initWizardJumpBySteps: function () {
            $(this.el).on('click', '.wizard-step > h3', function(e, index) {
                e.preventDefault();
                var index = $(this.el).find('.wizard-step').index($(this).parent());

                $steps = $(this.el).find('.wizard-step form').each(function(key, step) {
                    var validator = $(this).data('bs.validator');
                    validator.validate();
                    if ((validator.isIncomplete() || validator.hasErrors()) && index > key) {
                        index = key;
                        return;
                    }
                });
                $(this.el).wizard(index + 1);
                $('#doc-form').perfectScrollbar('update');
            });
        },

        /**
         * Enable tooltips for the wizard
         */
        initWizardTooltip: function () {
            $(this.el).on('mouseover click', '[rel=tooltip]', function() {
                if (!$(this).data('bs.tooltip')) {
                    $(this).tooltip({ placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right', container: 'body'});
                    $(this).tooltip('show');
                }
            });
        },

        /**
         * Initialize the event handle to move to a step on click
         */
        initWizardOnStepped: function () {
            $(this.el).on('stepped.bs.wizard done.bs.wizard', '', function() {
                var article = $(this).find('.wizard-step.active').data('article');
                if (article && article === 'top') {
                    $('#doc').scrollTo();
                } else if (article && $('.article[data-reference=' + article + ']').length){
                    $('.article[data-reference=' + article + ']').scrollTo();
                }

                $('.help-step').hide();

                var step = $(this.el).children('.wizard-step.active').index();
                $('#doc-help').children('.help-step').eq(step).show();
                $('#doc-sidebar ol').children('li').eq(step).addClass('active');

                // Scroll form to active step
                // TODO: Please determine the offset dynamically somehow
                var offset = $('.navbar-header').is(':visible')
                    ? $('.navbar-header').height()
                    : (($('#doc-preview-switch-container').outerHeight() || 0) + 15);
                var offsetH1 = $('h1.template-name').outerHeight();
                
                var pos = $(".wizard-step.active").position().top;
                var padding = 10;
                
                $('#doc-form').animate({scrollTop: pos + offset + offsetH1 + padding}, 500, 'swing', function() {
                    $('#doc-form').perfectScrollbar('update');
                });
            });
        },

        /**
         * Preview switch for mobile
         */
        initPreviewSwitch: function () {
            $('#doc').offcanvas({placement: 'right', toggle: false, autohide: false});
            
            $('#nav-show-form').on('click', function() {
                $('#doc').offcanvas('hide');
            });

            $('#nav-show-info').on('click', function() {
                $('#doc').removeClass('show-preview').offcanvas('show');
            });

            $('#nav-show-preview').on('click', function() {
                $('#doc').addClass('show-preview').offcanvas('show');
            });
        },
        
        //Init validation
        initValidation: function() {
            var ractive = this;

            //Fields for custom validation
            var textFields = 'input[type="text"], input[type="number"], input[type="email"], textarea';
            var stateFields = 'input[type="radio"], input[type="checkbox"], select';

            // date picker
            $('#doc-form').on('dp.change', function(e) {
                var input = $(e.target).find(':input').get(0);
                validateField(input);
            });

            // Custom validation
            $('#doc-form').on('change', ':input', function() {
                validateField(this);
            });

            // Launch validation when interacting with text field
            $('#doc-form').on('focus keyup', textFields, function(e) {
                handleValidation(this);
            });

            // Launch validation when interacting with "state" field
            $('#doc-form').on('click', stateFields, function(e) {
                handleValidation(this);
            });

            // Close programaticaly opened tooltip when leaving field
            $('#doc-form').on('blur', textFields + ', ' + stateFields, function() {
                var help = $(this).closest('.form-group').find('[rel="tooltip"]');
                var tooltip = $(help).data('bs.tooltip');
                if (tooltip && tooltip.$tip.hasClass('in')) $(help).tooltip('hide');
            });

            //Close programaticaly opened tooltips on form scroll
            $('#doc-form').on('scroll', function() {
                $('[rel="tooltip"]').each(function() {
                    var tooltip = $(this).data('bs.tooltip');
                    if (tooltip && tooltip.$tip.hasClass('in')) $(this).tooltip('hide');
                });
            });

            // Init and show tooltips
            $('#doc-wizard').on('mouseover click', '[rel=tooltip]', function() {
                initTooltip(this);
            });

            $('#doc-wizard form').validator();

            // validation
            $('#doc-wizard').on('step.bs.wizard done.bs.wizard', '', function(e) {
                if (e.direction === 'back' || ractive.get('validation_enabled') === false) return;

                var validator = $(this).find('.wizard-step.active form').data('bs.validator');
                validator.validate();

                $('#doc-form :not(.selectize-input)>:input:not(.btn)').each(function() {
                    validateField(this);
                    $(this).change();
                });

                if (validator.isIncomplete() || validator.hasErrors()) {
                    e.preventDefault();
                    return;
                }

                if (e.type === 'done') $('#doc-form').trigger('done.completed');
            });


            //Launch validation and tooltips
            function handleValidation(input) {
                validateField(input);

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
                        initTooltip(help, true);
                    }, $(input).is(stateFields) ? 300 : 0);
                } else if (isValid && isShown) $(help).tooltip('hide');
            }
            //Perform custom field validation
            function validateField(input) {
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
                var meta = ractive.get('meta')[keypath[0]];
                name = keypath[0];

                if (keypath.length > 1) {
                    for (var i = 1; i < keypath.length; i++) {
                        if (!meta[keypath[i]]) break;

                        meta = meta[keypath[i]];
                        name += '.' + keypath[i];
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

                var validation = meta.validation;

                if ($.trim(validation).length > 0) {
                    var result = ractive.get(name + '-validation');
                    if (!result) {
                        $(input).get(0).setCustomValidity(error);
                        return;
                    }
                }

                $(input).get(0).setCustomValidity('');
            }

            //Init and show tooltip for the first time
            function initTooltip(element, show) {
                var inited = $(element).data('bs.tooltip');
                if (!inited) {
                    $(element).tooltip({ placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right', container: 'body'});
                }

                if (!inited || show) $(element).tooltip('show');
            }
        },

        /**
         * Turn element into selectize control for external source select
         *
         * @param {Element} element
         */
        initExternalSourceUrl: function(element) {
            var ractive = this;

            $(element).each(function() {
                var input = this;
                var valueField = $(input).attr('value_field') || $(input).attr('label_field');
                var labelField = $(input).attr('label_field');
                var searchField = [labelField];
                var options = [];
                var name = $(input).attr('name');
                var value = ractive.get(name);
                var xhr;

                //If there should be user input in external url params, then we use this score function, to prevent
                //native selectize filter. We consider, that server response already has all matched items
                var score = function() {
                    return function() { return 1 };
                };

                //By default it is set to empty object
                if (typeof value === 'object' && typeof value[labelField] === 'undefined') value = null;
                if (value) options = [typeof value === 'string' ? {valueField: value, labelField: value} : value];

                var selectize = $(this).selectize({
                    valueField: valueField,
                    searchField: searchField,
                    labelField: labelField,
                    maxItems: 1,
                    create: false,
                    options: options,
                    load: function(query, callback) {
                        this.clearOptions();
                        if (xhr) xhr.abort();
                        if (!query.length) return callback();

                        var url = $(input).attr('url');
                        this.settings.score = url.indexOf('%value%') === -1 ? false : score;
                        url = extendExternalUrl(url, query);

                        xhr = $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            headers: getCustomHeaders(input)
                        }).fail(function() {
                            callback();
                        }).success(function(res) {
                            callback(res);
                            if(query.length && !res.length) selectize.open();
                        });
                    },
                    onItemAdd: function(value, item) {
                        if (valueField === labelField) {
                            var item = $.extend({}, this.options[value]);
                            delete item.$order;

                            ractive.set(name, item);
                        } else {
                            ractive.set(name, value);
                        }

                        // This is needed for correct custom validation of selected value.
                        // Without this, if value is not valid, class 'has-error' won't be added on first time validation occurs after page load
                        this.$input.change();
                    },
                    onDelete: function() {
                        ractive.set(name, null);
                    }
                });

                if (typeof value === 'string') selectize.setValue(value);

                //Get additional headers for external source
                function getCustomHeaders(input) {
                    var names = $(input).attr('headername');
                    var values = $(input).attr('headervalue');

                    if (!names || !values) return {};

                    names = names.replace(' &amp; ', ', ').replace(' & ', ', ').split(', ');
                    values = values.replace(' &amp; ', ', ').replace(' & ', ', ').split(', ');

                    return combineHeadersNamesAndValues(names, values);
                }
            });
        },

        //Init external data fields in 'use' mode
        initExternalData: function(field) {
            var ractive = this;

            //Watch for changes in url and field conditions
            if (field.type !== 'external_data') return;

            var target = field.url_field;
            if (field.conditions_field) target += ' ' + field.conditions_field;

            ractive.observe(target, function() {
                handleObserve(field);
            }, {defer: true, init : false});

            handleObserve(field);

            //Handle observed changes
            function handleObserve(field) {
                var url = ractive.get(field.url_field);
                //When url is computed by ractive and some of variables in GET query is not defined, than it's value becomes 'undefined'
                url = url.replace(/=undefined\b/g, '=');

                field.conditions && !ractive.get(field.conditions_field) ?
                    ractive.set(field.name, null) :
                    loadExternalUrl(url, field);
            }

            //Load data from external url
            function loadExternalUrl(url, field) {
                $.ajax({
                    url: url,
                    type: 'get',
                    headers: combineHeadersNamesAndValues(field.headerName || [], field.headerValue || [])
                }).done(function(response) {
                    if (field.jmespath && field.jmespath.length) {
                        try {
                            response = jmespath.search(response, field.jmespath);
                        } catch (e) {
                            $.alert('error', 'External data JMESPath error: ' + e);
                            response = null;
                        }
                    }

                    ractive.set(field.name, response);
                }).fail(function(xhr) {
                    $.alert('error', 'Failed to load external data from ' + url);
                });
            }
        }
    });

    /**
     * Apply callback to the meta data of each field
     *
     * @param {string}   key
     * @param {object}   meta
     * @param {function} callback
     */
    function metaRecursive(key, meta, callback) {
        if (arguments.length === 2) {
            callback = meta;
            meta = key;
            key = null;
        }

        if (!meta) {
            meta = {};
        }

        if (typeof meta.type === 'undefined' || typeof meta.type === 'object') {
            $.each(meta, function(k2, m2) {
                metaRecursive((key ? key + '.' : '') + k2, m2, callback)
            });

            return;
        }

        callback(key, meta);
    }

    /**
     * Set (nested) property of object using dot notation
     *
     * @param {object} target
     * @param {string} key
     * @param          value
     */
    function setByKeyPath(target, key, value) {
        var parts = key.split('.');

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            if (i < parts.length -1) {
                if (typeof target[part] !== 'object') {
                    target[part] = {};
                }

                target = target[part];
            } else {
                target[part] = value;
            }
        }
    }

    /**
     * Get values from options, applying defaults
     *
     * @param {object} options
     * @returns {object}
     */
    function getValuesFromOptions(options) {
        // default date
        var today = moment();
        today.defaultFormat = "L";

        // Set correct defaults for dates
        metaRecursive(options.meta, function(key, meta) {
            if (meta.default === 'today') {
                setByKeyPath(options.defaults, key, today);
            } else if (meta.type === "date") {
                setByKeyPath(options.defaults, key, "");
            }
        });

        var globals = {
            vandaag: today,
            today: today,
            currency: '€',
            valuta: '€'
        };

        return $.extend(true, {}, options.defaults, options.values, globals, {meta: options.meta})
    }
})(jQuery, Ractive, jmespath);
