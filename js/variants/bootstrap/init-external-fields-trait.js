
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapInitExternalFieldsTrait;
}

/**
 * Bootstrap init for some external fields
 */
function BootstrapInitExternalFieldsTrait() {
    this.initExternalSourceSelect = function(ractive, element, field) {
        var variant = this;

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
            variant.triggerExternalSourceSelectLoad(input);
        });
    };

    this.triggerExternalSourceSelectLoad = function(element) {
        var $element = $(element);
        var selectize = $element.selectize();
        if (!selectize) return;

        selectize = selectize[0].selectize;
        var selectedText = $element.closest('.form-group').find('.selectize-control .selectize-input > .item:first-child').html();
        if (typeof selectedText === 'undefined') selectedText = '';

        selectize.onSearchChange(selectedText);
    }

    this.isExternalSourceSelectInitialized = function(input) {
        return $(input).hasClass('selectized');
    }
}
