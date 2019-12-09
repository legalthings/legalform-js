/**
 * Bootstrap-specific implementation of some legalform-js methods
 */
function BootstrapVariant() {
    var self = this;

    this.initTooltip = function(element, show) {
        var $element = $(element);
        var inited = $element.data('bs.tooltip');

        if (!isset(inited)) {
            $element.tooltip({
                placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right',
                container: 'body'
            });
        }

        if (!inited || show) $element.tooltip('show');
    }

    this.isTooltipShown = function(help) {
        var tooltip = $(help).data('bs.tooltip');

        return isset(tooltip) && tooltip.$tip.hasClass('in');
    }

    this.hideTooltip = function(help) {
        var $help = $(help);
        var tooltip = $help.data('bs.tooltip');

        if (isset(tooltip) && tooltip.$tip.hasClass('in')) $help.tooltip('hide');
    }

    this.initFormValidator = function(form) {
        $(form).validator();
    }

    this.getFormValidator = function(form) {
        return $(form).data('bs.validator');
    }

    this.launchFormValidator = function(form) {
        $(form).validator('validate');
    }

    this.updateFormValidator = function(form) {
        $(form).validator('update');
    }

    this.isFormValidatorInvalid = function(form) {
        var validator = this.getFormValidator(form);

        return validator.isIncomplete() || validator.hasErrors();
    }

    this.initFormScroll = function() {
        $('.form-scrollable').perfectScrollbar();
    }

    this.updateFormScroll = function() {
        $('.form-scrollable').perfectScrollbar('update');
    }

    this.alert = function(status, message, callback) {
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

    this.initDatePicker = function(elWizard, locale) {
        var $wizard = $(elWizard);

        $wizard.find('[data-picker="date"]').each(init); //do on page init, to convert date format from ISO
        $wizard.on('click', '[data-picker="date"]', init); //do for fields, that were hidden on page init

        function init(e) {
            var $inputGroup = $(this);
            if ($inputGroup.data('DateTimePicker')) return;

            var yearly = $inputGroup.find('input').attr('yearly');
            var format = yearly ? 'DD-MM' : 'DD-MM-YYYY';

            $inputGroup.datetimepicker({
                locale: locale,
                format: format,
                extraFormats: ['YYYY-MM-DDTHH:mm:ssZ'], //Allow ISO8601 format for input
                dayViewHeaderFormat: yearly ? 'MMMM' : 'MMMM YYYY',

                //Allow arrow keys navigation inside date text field
                keyBinds: {
                    up: null,
                    down: function (widget) {
                        if (!widget) this.show();
                    },
                    left: null,
                    right: null,
                    t : null,
                    delete : null
                }
            });

            if (typeof e !== 'undefined') {
                $(e.target).closest('.input-group-addon').trigger('click');
            }
        }
    }

    /**
     * Change all selects to the selectize
     */
    this.initSelect = function (element, ractive) {
        $(element).each(function() {
            var select = this;
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
                onChange: function(value) {
                    if (value !== '' && value !== null) {
                        $($select).parent().parent().addClass('is-filled');
                    }

                    ractive.set(name, value);
                    ractive.validation.validateField(select);
                    $($select).change();
                },
                onBlur: function() {
                    ractive.validation.validateField(select);
                    $($select).change();
                }
            });
        });
    };

    this.initExternalSourceSelect = function(ractive, element, field) {
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
                    url = ltriToUrl(url).replace('%value%', encodeURIComponent(query));
                    url = clearComputedUrl(url);

                    xhr = $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        headers: combineHeadersNamesAndValues(field.headerName || [], field.headerValue || [])
                    }).fail(function() {
                        callback();
                    }).success(function(res) {
                        res = ractive.applyJMESPath(res, jmespathRequest, jmespath);

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
    };

    this.triggerExternalSourceSelectLoad = function(element) {

    }

    this.isExternalSourceSelectInitialized = function(input) {
        return $(input).hasClass('selectized');
    }

    this.shouldRebuildSelect = function(input) {
        var $input = $(input);

        return $input.is('select') && !$input.hasClass('selectized');
    }

    function isset(tooltip) {
        return typeof tooltip !== 'undefined' && tooltip;
    }
}
