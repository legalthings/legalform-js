(function($, Ractive, jmespath) {
    window.RactiveLegalForm = Ractive.extend({
        /**
         * Wizard DOM element
         */
        elWizard: null,

        /**
         * Current locale
         */
        locale: 'en_US',

        /**
         * Number of steps in the wizard
         */
        stepCount: null,

        /**
         * Validation service
         */
        validation: null,

        /**
         * Suffixes in keypath names that determine their special behaviour
         * @type {Object}
         */
        suffix: {
            conditions: '-conditions',
            expression: '-expression',
            amount: '.amount'
        },

        /**
         * Called by Ractive on initialize, before template is rendered
         */
        oninit: function() {
            this.initLegalForm();
        },

        /**
         * Initialize Ractive for LegalForm
         */
        initLegalForm: function() {
            this.set(this.getValuesFromOptions());
            this.observe('*', $.proxy(this.onChangeLegalForm, this), {defer: true});
        },

        /**
         * Use Robin Herbots Inputmask rather than Jasny Bootstrap inputmask
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

                    Inputmask({mask: mask, showMaskOnHover: false}).mask($origin);
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
         * Keypath and values will correspond to upper object in hierarchy of nested objects.
         * Actual names and values would be passed only for computed properties.
         *
         * @param          newValue (not used)
         * @param          oldValue (not used)
         * @param {string} keypath
         */
        onChangeLegalForm: function (newValue, oldValue, keypath) {
            if (newValue === oldValue) {
                return;
            }

            if (this.isCondition(keypath)) {
                this.onChangeCondition(newValue, oldValue, keypath);
            }

            if ($(this.el).hasClass('material')) {
                $(this.el).toMaterial();
            }

            this.updateExpressions(newValue, oldValue, keypath);

            setTimeout($.proxy(this.rebuildWizard, this), 200);
            setTimeout($.proxy(this.refreshLikerts, this), 10);
        },

        /**
         * Handle conditions change in some special cases
         *
         * @param          newValue (not used)
         * @param          oldValue (not used)
         * @param {string} keypath
         */
        onChangeCondition: function(newValue, oldValue, keypath) {
            var name = unescapeDots(keypath.replace(this.suffix.conditions, ''));
            var input = '#doc-wizard [name="' + name + '"]';

            if (!newValue && oldValue !== undefined) {
                var set = getByKeyPath(this.defaults, name, undefined);

                if (typeof set === 'undefined') {
                    set = '';
                } else if ($.type(set) === 'object') {
                    var toString = set.toString;
                    set = $.extend({}, set);

                    //$.extend does not copy hidden toString property, in case if we redefined it
                    defineProperty(set, 'toString', toString);
                }

                // Set field value to empty/default if condition is not true
                this.set(name, set);
            } else {
                var rebuild = $(input).is('select') && !$(input).hasClass('selectized');
                if (rebuild) this.initSelectize(input);
            }
        },

        /**
         * We do not use computed for expression field itself, to avoid escaping dots in template,
         * because in computed properties dots are just parts of name, and do not represent nested objects.
         * We use additional computed field, with another name.
         * So when it's value is changed, we set expression field value.
         *
         * @param  {mixed} newValue
         * @param  {mixed} oldValue
         * @param  {string} keypath
         */
        updateExpressions: function(newValue, oldValue, keypath) {
            if (!this.isExpression(keypath)) return;

            var ractive = this;
            var name = unescapeDots(keypath.replace(this.suffix.expression, ''));

            //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
            setTimeout(function() {
                ractive.set(name, newValue);
            }, 10);
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
            if (!this.elWizard || $(this.elWizard).find('.wizard-step').length === this.stepCount) return;

            $(this.elWizard).wizard('refresh');
            this.stepCount = $(this.el).find('.wizard-step').length;

            if (this.validation) this.validation.initBootstrapValidation();
        },

        /**
         * Method that is called when Ractive is complete
         */
        oncomplete: function () {
            this.completeLegalForm();
        },

        /**
         * Apply complete for LegalForm
         */
        completeLegalForm: function () {
            this.handleChangeDropdown();
            this.handleChangeDate();
            this.initSelectize($(this.el).find('select'));

            this.initWizard();
            $('.form-scrollable').perfectScrollbar();

            this.initDatePicker();
            this.initInputmask();
            this.initPreviewSwitch();
            this.refreshLikerts();

            metaRecursive(this.meta, $.proxy(this.initField, this));

            this.on('complete', function() {
                $('#doc').trigger('shown.preview');
            })
        },

        /**
         * Init date picker
         */
        initDatePicker: function () {
            var ractive = this;

            $(this.elWizard).on('click', '[data-picker="date"]', function(e) {
                if ($(this).data('DateTimePicker')) return;

                $(this).datetimepicker({ locale: ractive.getLocale('short'), format: 'DD-MM-YYYY' });
                $(e.target).closest('.input-group-addon').trigger('click');

                //Fix material label
                $(this).find(':input').on('focusout', function(e) {
                    if (e.target.value !== '') {
                        $(e.target).parent().parent().removeClass('is-empty');
                    } else {
                        $(e.target).parent().parent().addClass('is-empty');
                    }
                });
            });
        },

        /**
         * Initialize special field types
         */
        initField: function (key, meta) {
            var amountFields = [];

            if (meta.type === 'amount') {
                amountFields.push(key + this.suffix.amount);
                this.initAmountField(key, meta);
            } else if (meta.type === 'external_data') {
                this.initExternalData($.extend({name: key}, meta));
            } else if (meta.external_source) {
                this.initExternalSource($.extend({name: key}, meta));
            }

            this.initAmountChange(amountFields);
        },

        /**
         * Init change of amount options from singular to plural, and backwords.
         * This can not be processed in base form change observer, as it needs fields names.
         * @param {array} fields  All amount fields' names
         */
        initAmountChange: function(fields) {
            if (!fields.length) return;

            this.observe(fields.join(' '), function(newValue, oldValue, keypath) {
                var key = keypath.replace(/\.amount$/, '');
                var oldOptions = this.get('meta.' + key + '.' + (newValue == 1 ? 'plural' : 'singular'));
                var newOptions = this.get('meta.' + key + '.' + (newValue == 1 ? 'singular' : 'plural'));
                var index = oldOptions ? oldOptions.indexOf(this.get(key + '.unit')) : -1;

                if (newOptions && index !== -1) this.set(key + '.unit', newOptions[index]);
            }, {defer: true});
        },

        /**
         * Set toString method for amount value, which add the currency.
         * Also update current units, as they might have been changed when reloading builder,
         * and amount object was taken from previous ractive instance with old units
         *
         * @param {string} key
         * @param {object} meta
         */
        initAmountField: function (key, meta) {
            var value = this.get(key);
            if (!value) return;

            //Set units, if they were changed from previous bilder session
            var meta = this.get('meta.' + key);
            var newUnits = value.amount == 1 ? meta.singular : meta.plural;
            if (newUnits.indexOf(value.unit) === -1) {
                value.unit = newUnits[0];
            }

            //Set toString method
            var toString = function() {
                return (this.amount !== '' && this.amount !== null) ? this.amount + ' ' + this.unit : '';
            };

            defineProperty(value, 'toString', toString);
            this.update(key);

            var defaultValue = getByKeyPath(this.defaults, key, undefined);
            if (!defaultValue) return;

            defineProperty(defaultValue, 'toString', toString);
            setByKeyPath(this.defaults, key, defaultValue);
        },

        /**
         * Handle selecting a value through the dropdown
         */
        handleChangeDropdown: function () {
            var ractive = this;

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
        initSelectize: function (element) {
            var ractive = this;

            $(element).each(function() {
                var $select = $(this);
                var name = $select.attr('name');

                var selectize = $select.selectize({
                    create: false,
                    allowEmptyOption: true,
                    render: {
                        option: function(item, escape) {
                            if (item.value === '' && $select.attr('required')) {
                                return '<div class="dropdown-item" style="pointer-events: none; color: #aaa;">' + escape(item.text) + '</div>';
                            }

                            return '<div class="dropdown-item">' + escape(item.text) + '</div>';
                        }
                    },
                    onDropdownClose: function($dropdown) {
                        var value = ractive.get(name);

                        if (value !== '' && value !== null) {
                            $dropdown.parent().parent().removeClass('is-empty');
                        }
                    },
                    onChange: function(value) {
                        ractive.set(name, value);
                        ractive.validation.validateField($select);
                        $($select).change();
                    },
                    onBlur: function() {
                        ractive.validation.validateField($select);
                        $($select).change();
                    }
                });
            });
        },

        /**
         * Initialize the Bootstrap wizard
         */
        initWizard: function () {
            this.elWizard = $(this.el).find('.wizard').addBack('.wizard')[0];

            this.initWizardJumpBySteps();
            this.initWizardTooltip();
            this.initWizardOnStepped();

            if (this.validation) {
                this.validation.init(this);
            }

            $(this.elWizard).wizard('refresh');
            this.stepCount = $(this.elWizard).find('.wizard-step').length;
        },

        /**
         * Jump to a step by clicking on a header
         */
        initWizardJumpBySteps: function () {
            var ractive = this;

            $(this.elWizard).on('click', '.wizard-step > h3', function(e, index) {
                e.preventDefault();
                var index = $(ractive.el).find('.wizard-step').index($(this).parent());

                $(ractive.el).find('.wizard-step form').each(function(key, step) {
                    var validator = $(this).data('bs.validator');
                    validator.validate();

                    $(this).find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                        ractive.validation.validateField(this);
                        $(this).change();
                    });

                    if ((validator.isIncomplete() || validator.hasErrors()) && index > key) {
                        index = key;
                        return;
                    }
                });

                $(ractive.elWizard).wizard(index + 1);
                $('.form-scrollable').perfectScrollbar('update');
            });
        },

        /**
         * Enable tooltips for the wizard
         */
        initWizardTooltip: function () {
            $(this.elWizard).on('mouseover click', '[rel=tooltip]', function() {
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
            var elWizard = this.elWizard;

            $(elWizard).on('stepped.bs.wizard done.bs.wizard', '', function() {
                var article = $(this).find('.wizard-step.active').data('article');
                var $scrollElement = false;
                if (article && article === 'top') {
                    $scrollElement = $('#doc');
                } else if (article && $('.article[data-reference=' + article + ']').length){
                    $scrollElement = $('.article[data-reference=' + article + ']');
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
        },

        /**
         * Preview switch for mobile
         */
        initPreviewSwitch: function () {

            $('#nav-show-info, #nav-show-preview, #nav-show-form').on('click', function() {
                $('#nav-show-info, #nav-show-preview, #nav-show-form').removeClass('active');
                $(this).addClass('active');
            });

            $('#nav-show-info').on('click', function() {
                $('#doc').removeClass('show-preview');
            });

            $('#nav-show-preview').on('click', function() {
                $('#doc').addClass('show-preview');
            });
        },

        /**
         * Init external source field
         * @param  {object} field
         */
        initExternalSource: function(field) {
            var ractive = this;
            var urlField = escapeDots(field.url_field);
            var conditionsField = escapeDots(field.conditions_field);

            var target = urlField;
            if (conditionsField) target += ' ' + conditionsField;

            //Watch for changes in url and conditions
            ractive.observe(target, function() {
                handleObserve(field);
            }, {defer: true, init : false});

            handleObserve(field);

            //Handle observed changes
            function handleObserve(field) {
                if (field.conditions && !ractive.get(conditionsField)) return;

                var $element = $(ractive.elWizard).find('input[name="' + field.name + '"]');

                if (!$element.hasClass('selectized')) return ractive.initExternalSourceSelectize($element, field); //Handle condition change

                //Handle url change. Auto launch search with current shown field text
                triggerSelectizeLoad($element);
            }
        },

        /**
         * Turn element into selectize control for external source select
         *
         * @param {Element} element
         */
        initExternalSourceSelectize: function(element, field) {
            var ractive = this;

            $(element).each(function() {
                var input = this;
                var valueField = $(input).attr('value_field') || $(input).attr('label_field');
                var labelField = $(input).attr('label_field');
                var jmespathRequest = $(input).attr('jmespath');
                var useValue = $(input).attr('url').indexOf('%value%') !== -1;
                var searchField = [labelField];
                var options = [];
                var name = field.name;
                var value = ractive.get(name);
                var xhr;

                //If there should be user input in external url params, then we use this score function, to prevent
                //native selectize filter. We consider, that server response already has all matched items
                var score = function() {
                    return function() { return 1 };
                };

                //By default it is set to empty object
                if (value && typeof value === 'object' && typeof value[valueField] === 'undefined') value = null;
                if (value) {
                    var option = value;
                    if (typeof value === 'string') {
                        option = {};
                        option[valueField] = value;
                        option[labelField] = value;
                    }

                    options = [option];
                }

                var selectize = $(this).selectize({
                    valueField: valueField,
                    searchField: searchField,
                    labelField: labelField,
                    maxItems: 1,
                    create: false,
                    options: options,
                    load: function(query, callback) {
                        var self = this;
                        var url = ractive.get(escapeDots(field.url_field));
                        var send = query.length || (!self.isFocused && !useValue);

                        this.clearOptions();

                        if (xhr) xhr.abort();
                        if (!send) return callback();

                        this.settings.score = useValue ? score : false;
                        url = ltriToUrl(url).replace('%value%', encodeURI(query));
                        url = clearComputedUrl(url);

                        xhr = $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            headers: combineHeadersNamesAndValues(field.headerName || [], field.headerValue || [])
                        }).fail(function() {
                            callback();
                        }).success(function(res) {
                            res = applyJMESPath(res, jmespathRequest);

                            var option = null;
                            var value = null;

                            //Determine if we can autoselect value
                            if (field.autoselect && res.length === 1) {
                                option = res[0];
                                if (option && typeof option[valueField] !== 'undefined') value = option[valueField];
                            }

                            if (value) {
                                callback();
                                self.clearOptions();
                                self.clear(true);
                                self.addOption(option);
                                self.setValue(value);
                                $(input).closest('.form-group').hide();
                            } else {
                                callback(res);
                                $(input).closest('.form-group').show();
                                if (query.length && !res.length && self.isFocused) self.open();
                            }
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
                    },
                    onChange: function(value) {
                        ractive.validation.validateField(input);
                        $(input).change();
                    },
                    onBlur: function() {
                        ractive.validation.validateField(input);
                        $(input).change();
                    }
                });

                if (typeof value === 'string') {
                    selectize[0].selectize.setValue(value);
                } else if (options.length) {
                    selectize[0].selectize.setValue(options[0][valueField]);
                }

                //Preload selectize on page load. Selectize setting "preload" can not be used for this, because we set initial selectize value after init
                triggerSelectizeLoad(input);
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

            var urlField = escapeDots(field.url_field);
            var conditionsField = escapeDots(field.conditions_field);

            var target = urlField;
            if (conditionsField) target += ' ' + conditionsField;

            ractive.observe(target, function() {
                handleObserve(field);
            }, {defer: true, init : false});

            handleObserve(field);

            //Handle observed changes
            function handleObserve(field) {
                var url = ractive.get(urlField);
                url = clearComputedUrl(url);

                field.conditions && !ractive.get(conditionsField) ?
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
                    response = applyJMESPath(response, field.jmespath);
                    ractive.set(field.name, response);
                }).fail(function(xhr) {
                    ractive.alert('error', 'Failed to load external data from ' + url);
                });
            }
        },

        /**
         * Remove empty list items from content, or show hidden non-empty
         *
         * @param {string} action
         */
        refreshListItems: function(action) {
            $('#doc-content li').each(function() {
                var $li = $(this);
                if($li.text().length == 0) {
                    if(action == 'remove') {
                        $li.remove();
                    } else {
                        $li.hide();
                    }
                } else if(action != 'remove' && $li.text().length != 0) {
                    $li.show();
                }
            });
        },

        /**
         * Get values from options, applying defaults
         *
         * @returns {object}
         */
        getValuesFromOptions: function() {
            var ractive = this;

            // default date
            moment.locale(this.locale);
            var today = moment().format("L");
            today.defaultFormat = "L";

            // Set correct defaults for dates
            metaRecursive(this.meta, function(key, meta) {
                if (meta.default === 'today') {
                    setByKeyPath(ractive.defaults, key, today);
                } else if (meta.type === "date") {
                    setByKeyPath(ractive.defaults, key, "");
                }
            });

            var globals = {
                vandaag: today,
                today: today,
                currency: '€',
                valuta: '€'
            };

            return $.extend(true, {}, this.defaults, this.values, globals, {meta: this.meta});
        },

        /**
         * Get locale of template or document
         * @param  {string} format
         * @return {string}
         */
        getLocale: function(format) {
            var locale = this.locale;
            var delimiter = '_';
            var pos = locale.indexOf(delimiter);

            if (format === 'short') {
                if (pos !== -1) locale = locale.substr(0, pos);
            } else if (format === 'momentjs') {
                locale = locale.toLowerCase();
                if (pos !== -1) {
                    parts = locale.split(delimiter);
                    locale = parts[0] === parts[1] ? parts[0] : parts.join('-');
                }
            } else if (format) {
                throw 'Unknown format "' + format + '" for getting document locale';
            }

            return locale;
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
        },

        /**
         * Determine if keypath belongs to condition variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isCondition: function(keypath) {
            return endsWith(keypath, this.suffix.conditions);
        },

        /**
         * Determine if keypath belongs to expression variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isExpression: function(keypath) {
            return endsWith(keypath, this.suffix.expression);
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
     * Get (nested) property of object using dot notation
     *
     * @param {object} target
     * @param {string} key
     * @param          defaultValue
     */
    function getByKeyPath(target, key, defaultValue) {
        if (!target || !key) return false;

        key = key.split('.');
        var l = key.length,
            i = 0,
            p = '';

        for (; i < l; ++i) {
            p = key[i];

            if (target.hasOwnProperty(p)) target = target[p];
            else return defaultValue;
        }

        return target;
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

    /**
     * Parse jmespath response
     * @param  {object} data
     * @param  {string} jmespathRequest  JMESPath transformation
     * @return {string}
     */
    function applyJMESPath(data, jmespathRequest) {
        if (typeof jmespathRequest !== 'string' || !jmespathRequest.length) return data;

        try {
            return jmespath.search(data, jmespathRequest);
        } catch (e) {
            ractive.alert('error', 'JMESPath error: ' + e);
            return null;
        }
    }

    /**
     * Trigger selectize load
     * @param  {string|object} element
     */
    function triggerSelectizeLoad(element) {
        var selectize = $(element).selectize();
        if (!selectize) return;

        selectize = selectize[0].selectize;
        var selectedText = $(element).closest('.form-group').find('.selectize-control .selectize-input > .item:first-child').html();
        if (typeof selectedText === 'undefined') selectedText = '';

        selectize.onSearchChange(selectedText);
    }

    /**
     * Determine if keypath ends with string
     * @param  {string}  keypath
     * @param  {string}  suffix
     * @return {Boolean}
     */
    function endsWith(keypath, suffix) {
        return keypath.indexOf(suffix) === keypath.length - suffix.length;
    }

    /**
     * Remove placeholders of empty values (e.g. 'null', 'undefined') in computed external url
     * @return {string}
     */
    function clearComputedUrl(url) {
        return url.replace(/=(undefined|null)\b/g, '=');
    }
})(jQuery, Ractive, jmespath);
