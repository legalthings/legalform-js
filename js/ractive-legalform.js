(function($, Ractive, jmespath) {
    window.RactiveLegalForm = Ractive.extend({
        /**
         * Current locale
         */
        locale: null,

        /**
         * Number of steps in the wizard
         */
        stepCount: null,

        /**
         * Validation service
         */
        validation: null,

        
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

            if (options.validation) {
                this.validation = options.validation;
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

            if (this.validation) this.validation.initBootstrapValidation();
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
            $('#doc-form').perfectScrollbar();

            this.initPreviewSwitch();
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

            if (this.validation) {
                this.validation.init(this);
            }

            $(this.el).wizard('refresh');
            this.stepCount = $(this.el).find('.wizard-step').length;
        },

        /**
         * Jump to a step by clicking on a header
         */
        initWizardJumpBySteps: function () {
            $(this.el).on('click', '.wizard-step > h3', function(e, index) {
                e.preventDefault();
                var index = $(this.el).find('.wizard-step').index($(this).parent());

                $(this.el).find('.wizard-step form').each(function(key, step) {
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
                    $(this).tooltip({ placement: 'left', container: 'body'});
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
                        url = ltriToUrl(url).replace('%value%', encodeURI(query));

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

                if (typeof value === 'string') selectize[0].selectize.setValue(value);

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

        /**
         * Init external data fields in 'use' mode
         *
         * @param {object} field
         */
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
                            ractive.alert('error', 'External data JMESPath error: ' + e);
                            response = null;
                        }
                    }

                    ractive.set(field.name, response);
                }).fail(function(xhr) {
                    ractive.alert('error', 'Failed to load external data from ' + url);
                });
            }
        },

        /**
         * Show alert message
         * @param  {string}   status    Message status (danger, warning, success)
         * @param  {string}   message   Message to show
         * @param  {Function} callback  Action to do after message is hidden
         */
        alert: function(status, message, callback) {
            if (typeof $.alert !== 'undefined') return $.alert(status, message, callback);

            if (status === 'error') status = 'danger';
            var $alert = $('<div class="alert alert-fixed-top">')
                .addClass('alert-' + status)
                .hide()
                .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
                .append(message)
                .appendTo('body')
                .fadeIn();
            
            setTimeout(function() {
                $alert.fadeOut(function() { 
                    this.remove(); 
                    if (callback)callback();
                });
            }, 3000);
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

    /**
     * Build object of http headers from headers names and values
     * @param  {array|string} names   Headers names
     * @param  {array|string} values  Headers values
     * @return {object}               Map of names to values
     */
    function combineHeadersNamesAndValues(names, values) {
        var result = {};

        if (typeof names === 'string') names = [names];
        if (typeof values === 'string') values = [values];

        for (var i = 0; i < names.length; i++) {
            if (typeof values[i] === 'undefined') continue;
            if (typeof result[names[i]] === 'undefined') {
                result[names[i]] = [];
            }

            result[names[i]].push(values[i]);
        }

        return result;
    }
})(jQuery, Ractive, jmespath);
