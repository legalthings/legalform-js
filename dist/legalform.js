
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = defineProperty;
}

/**
 * Define non-enumarable getter property on object
 *
 * @param {object} object
 * @param {string} name
 * @param {function} method
 */
function defineProperty(object, name, method) {
    Object.defineProperty(object, name, {
        enumerable: false,
        configurable: false,
        get: function() {
            return method;
        }
    });
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = escapeDots;
}

/**
 * Escape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function escapeDots(keypath) {
    return typeof keypath === 'string' ? keypath.replace(/\./g, '\\.') : keypath;
}
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
         * Initialize the bootrap vaidation for the forms
         */
        this.initBootstrapValidation = function () {
            $(this.elWizard).find('form').validator();
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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
    var ltriToUrl = require('./ltri-to-url');
}

function LegalForm($) {
    var self = this;
    var globals = [
        'Array', 'Date', 'JSON', 'Math', 'NaN', 'RegExp', 'decodeURI', 'decodeURIComponent', 'true', 'false',
        'encodeURI', 'encodeURIComponent', 'isFinite', 'isNaN', 'null', 'parseFloat', 'parseInt', 'undefined'
    ];

    if (typeof $ === 'undefined') {
        $ = window.jQuery;
    }

    this.attributes = {
        password: { type: 'password' },
        text: { type: 'text' },
        number: { type: 'text' },
        amount: { type: 'text' },
        money: { type: 'text', pattern: '\\d+(,\\d\\d)?' },
        date: { type: 'text', 'data-mask': '99-99-9999' },
        email: { type: 'email' },
        textarea: { rows: 3 }
    };

    /**
     * Build form html
     * @param  {array} definition  Form definition
     * @return {string}            Form html
     */
    this.build = function(definition) {
        var lines = [];
        lines.push('');

        $.each(definition, function(i, step) {
            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            lines.push('<div class="wizard-step"' + (step.article ? ' data-article="' + step.article + '"' : '') + '>');
            if (step.label) lines.push('<h3>' + step.label + '</h3>');
            lines.push('<form class="form navmenu-form">');

            $.each(step.fields, function(key, field) {
                lines.push(self.buildField( field, step.group || null, 'use'));
            });

            lines.push('</form>');
            lines.push('<div class="wizards-actions">');
            lines.push('<button data-target="#doc-wizard" data-toggle="wizard" data-step="prev" class="btn btn-default pull-left wizard-hide">Previous</button>');
            lines.push('<button data-target="#doc-wizard" data-toggle="wizard" data-step="next" class="btn btn-primary btn-rounded btn-outline pull-right wizard-hide in">Next</button>');
            lines.push('<button data-target="#doc-wizard" data-toggle="wizard" data-step="done" class="btn btn-success btn-rounded btn-outline pull-right wizard-hide">Finish</button>');
            lines.push('</div>'); // wizard actions
            lines.push('</div>'); // wizard step
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        });

        return lines.join('\n');
    }

    /**
     * Build form help html
     * @param  {array} definition  Form definition
     * @return {string}            Form help text html
     */
    this.buildHelpText = function(definition) {
        var lines = [];
        var hasHelp = false;

        lines.push('');
        $.each(definition, function(i, step) {
            if (step.helptext) hasHelp = true;

            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            lines.push('<div class="help-step" style="display: ' + (i == 0 ? 'block' : 'none') + '">')
            if (step.helptext) lines.push($('<div class="help-step-text"></div>').html(step.helptext).wrapAll('<div>').parent().html());
            if (step.helptip) lines.push($('<div class="help-step-tip"></div>').text(step.helptip).wrapAll('<div>').parent().html().replace(/\n/g, '<br>'));
            lines.push('</div>');
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        });

        return hasHelp ? lines.join('\n') : '';
    }

    /**
     * Build html for single form field
     * @param  {object} field
     * @param  {string} group           Group name
     * @param  {string} mode            'use' or 'build'
     * @param  {boolean} isFormEditable
     * @return {string}                 Field html
     */
    this.buildField = function(field, group, mode, isFormEditable) {
        var data = $.extend({}, field);
        var lines = [];
        var label, input;

        data.name = (group ? group + '.' : '') + data.name;
        data.id = 'field:' + data.name;
        if (mode === 'use') data.value = '{{ ' + data.name + ' }}';

        input = buildFieldInput(data, mode);
        if (!input) return null;

        if (data.label) {
            label = (mode === 'build' ? '<label>' : '<label for="' + data.id + '">') + data.label + '' + (data.required ? ' <span class="required">*</span>' : '') + '</label>';
        }

        // Build HTML
        if (mode === 'use' && data.conditions) lines.push('{{# ' + expandCondition(data.conditions, group)  + ' }}');
        lines.push('<div class="form-group" data-role="wrapper">');
        if (mode === 'build' && isFormEditable) {
            lines.push('<span class="delete close">&times;</span>');
            lines.push('<span class="copy fa fa-files-o">&nbsp;</span>');
        }

        if (label) lines.push(label);
        lines.push(input);

        if (mode === 'use' && data.helptext) {
            lines.push(
                $('<span class="help"><strong>?</strong></span>')
                    .attr('rel', 'tooltip')
                    .attr('data-html', 'true')
                    .attr('data-title', $('<div>').text(data.helptext).html().replace(/\n/g, '<br>').replace(/"/g, '&quot;')
                )[0].outerHTML
            );
        }

        lines.push('</div>');
        if (mode === 'use' && data.conditions) lines.push('{{/ ' + expandCondition(data.conditions, group) + ' }}');

        return lines.join('\n');
    }

    /**
     * Calculate form data based on definition
     * @param  {array} definition  Form definition
     * @return {object}
     */
    this.calc = function(definition) {
        return {
            defaults: calcDefaults(definition),
            computed: calcComputed(definition),
            meta: calcMeta(definition)
        }
    }

    /**
     * Calculate default values for form fields
     * @param  {array} definition  Form definition
     * @return {object}
     */
    function calcDefaults(definition) {
        var data = {};

        $.each(definition, function(i, step) {
            $.each(step.fields, function(key, field) {
                if (field.type === 'amount') {
                    addAmountDefaults(data, step.group, field);
                } else if (field.type === 'select' && !field.external_source) {
                    addGroupedData(data, step.group, field.name, '');
                } else if (field.type === 'group' && field.multiple) {
                    addGroupedData(data, step.group, field.name, []);
                } else {
                    addGroupedData(data, step.group, field.name, field.value);
                }
            });
        });

        return data;
    }

    /**
     * Calculate computed expressions for form fields
     * @param  {array} definition  Form definition
     * @return {object}
     */
    function calcComputed(definition) {
        var data = {};

        $.each(definition, function(i, step) {
            $.each(step.fields, function(key, field) {
                var name = (step.group ? step.group + '.' : '') + field.name;

                if (field.validation) {
                    data[name + '-validation'] = expandCondition(field.validation, step.group || '', true);
                }

                if (field.type === 'expression') {
                    setComputedForExpression(name, step, field, data);
                } else if (field.type === 'external_data' || field.external_source) {
                    setComputedForExternalUrls(name, step, field, data);
                }

                setComputedForConditions(name, step, field, data);
            });
        });

        return data;
    }

    /**
     * Calculate meta data for form fields
     * @param  {array} definition  Form definition
     * @return {object}
     */
    function calcMeta(definition) {
        var data = {};

        $.each(definition, function(i, step) {
            $.each(step.fields, function(key, field) {
                var meta = { type: field.type, validation: field.validation };

                if (field.today) meta.default = 'today';
                if (field.conditions_field) meta.conditions_field = field.conditions_field;

                if (field.type === 'amount') {
                    meta.singular = field.optionValue;
                    meta.plural = field.optionText;
                }

                if (field.external_source) {
                    var use = ['external_source', 'url', 'headerName', 'headerValue', 'conditions', 'url_field', 'jmespath', 'autoselect'];

                    for (var i = 0; i < use.length; i++) {
                        meta[use[i]] = field[use[i]];
                    }
                }

                if (field.type === 'external_data') {
                    var use = ['jmespath', 'url', 'headerName', 'headerValue', 'conditions', 'url_field'];

                    for (var i = 0; i < use.length; i++) {
                        meta[use[i]] = field[use[i]];
                    }
                }

                addGroupedData(data, step.group, field.name, meta);
            });
        });

        return data;
    }

    /**
     * Create html input for form field
     * @param  {object} data  Field data
     * @param  {string} mode  'use' or 'build'
     * @return {string}
     */
    function buildFieldInput(data, mode) {
        var excl = mode === 'build' ? 'data-mask;' : '';

        switch (data.type) {
            case 'number':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(.\\d{1,' + data.decimals + '})?') : '');
            case 'password':
            case 'text':
            case 'email':
                return strbind('<input class="form-control" %s %s>', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'amount':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(,\\d{1,' + data.decimals + '})?') : '');
                var input_amount = strbind('<input class="form-control" name="%s" value="%s" %s %s>', data.name + '.amount', mode === 'build' ? (data.value || '') : '{{ ' + data.name + '.amount }}', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type;id;name;value'));
                var input_unit;

                if (data.optionValue.length === 1) {
                    input_unit = strbind('<span class="input-group-addon">%s</span>', mode === 'build' ? data.optionValue[0] : '{{ ' + data.name + '.unit }}');
                } else {
                    input_unit = '\n' + strbind('<div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">%s <span class="caret"></span></button>', mode === 'build' ? data.optionValue[0] : '{{ ' + data.name + '.unit }}') + '\n';
                    if (mode === 'use') {
                        input_unit += strbind('<ul class="dropdown-menu pull-right dropdown-select" data-name="%s" role="menu">', data.name + '.unit') + '\n'
                        input_unit += '{{# %s.amount == 1 ? meta.%s.singular : meta.%s.plural }}<li><a>{{ . }}</a></li>{{/ meta }}'.replace(/%s/g, data.name) + '\n';
                        input_unit += '</ul>' + '\n'
                    }
                    input_unit += '</div>' + '\n';
                }

                return strbind('<div class="input-group" %s>' + input_amount + input_unit + '</div>', mode === 'build' ? attrString({id: data.id}) : '');

            case 'date':
                if (mode === 'build' && data.today) data.value = moment().format('L');
                return strbind('<div class="input-group" %s %s><input class="form-control" %s %s><span class="input-group-addon"><span class="fa fa-calendar"></span></span></div>', mode === 'build' ? '' : 'data-picker="date"' , mode === 'build' ? attrString({id: data.id}) : '', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type;id'));

            case 'money':
                return strbind('<div class="input-group"><span class="input-group-addon">%s</span><input class="form-control" %s %s></div>', mode === 'build' ? '&euro;' : '{{ valuta }}', attrString(self.attributes[data.type]), attrString(data, 'type' + (mode === 'build' ? ';id' : '')))

            case 'textarea':
                return strbind('<textarea class="form-control" %s %s></textarea>', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'select':
                if (data.external_source === "true") {
                    data = $.extend({}, data);
                    data.type = 'text';
                    data.value = '{{ ' + data.name + ' }}';
                    data.value_field = data.optionValue;
                    data.label_field = data.optionText;

                    return buildFieldInput(data, mode);
                }

                return strbind('<select class="form-control" %s >', attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')))
                    + '\n'
                    + buildOption('option', data, null, mode)
                    + '</select>'
                    + (mode === 'build' ? '<span class="select-over"></span>' : '');

            case 'group':
            case 'checkbox':
                type = data.type !== 'group' ? data.type : (data.multiple ? 'checkbox' : 'radio');
                return buildOption(type, data, self.attributes[data.type], mode);

            case 'likert':
                return buildLikert(data);

            case 'expression':
                if (mode !== 'build') return null;
                return '<em>' + data.name.replace(/^.+?\./, '.') + ' = ' + data.expression + '</em>';

            case 'external_data':
                if (mode !== 'build') return null;
                return '<em>' + data.name.replace(/^.+?\./, '.') + '</em> = <em>' + ltriToUrl(data.url) + '</em>';

            case 'static':
                if (mode === 'use') return data.content;
                return '<em>' + data.name.replace(/^.+?\./, '.') + '</em> = <em>' + data.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</em>';
        }

        return '<strong>' + data.type + '</strong>';
    }

    /**
     * Build string of attributes for html input
     * @param  {object} data     Field data
     * @param  {string} exclude  List of attributes to exclude
     * @return {string}
     */
    function attrString(data, exclude) {
        if (typeof data === 'undefined') return '';

        var dataKeys = 'mask'.split(';');

        if (typeof exclude === 'undefined') exclude = '';
        if (exclude === false) {
            exclude = [];
        } else {
            exclude += ';label;keys;values;conditions;text;optionValue;optionText;optionSelected;options;helptext';
            exclude = exclude.split(';');
        }

        var attr = '';
        for (var key in data) {
            if (data[key] && exclude.indexOf(key) < 0) {
                var prefix = dataKeys.indexOf(key) < 0 ? '' : 'data-';
                attr += prefix + key + '="' + data[key] + '" ';
            }
        }

        return $.trim(attr);
    }

    /**
     * Build option html for select element
     * @param  {string} type   Can also build options for checkbox set or radio set
     * @param  {object} data   Field data
     * @param  {string} extra  List of additional attributes
     * @param  {string} mode   'use' or 'build'
     * @return {string}
     */
    function buildOption(type, data, extra, mode) {
        var lines = [];

        var keys = data.optionText || [data.text];
        var values = data.optionValue;

        if (data.optionsText && mode === 'use') data.name = data.value;

        if (type === 'option') {
            lines.push('<option value="" ' + (data.required ? 'disabled' : '') + '>&nbsp;</option>');
        }

        for (var i = 0; i < keys.length; i++) {
            var key = $.trim(keys[i]);
            var value = values ? $.trim(values[i]) : null;

            if (!key) continue;

            if (type === 'option') {
                lines.push(strbind('<option value="%s">%s</option>', value, key));
            } else {
                var attr = $.extend({type: type}, mode === 'use' ? (value === null ? {checked: data.value} : {name: data.value, value: value}) : {name: data.name});
                lines.push(strbind('<div class="option"><label><input data-id="%s" %s %s %s/> %s</label></div>', data.name, attrString(data, 'id;name;value;type'), attrString(attr, false), attrString(extra, false), key));
            }
        }

        return lines.join('\n');
    }

    /**
     * Build html for likert questions set
     * @param  {object} data
     * @return {string}
     */
    function buildLikert(data) {
        var questions = $.each($.trim(data.keys).split('\n'), $.trim);
        var options = $.each($.trim(data.values).split('\n'), $.trim);
        var lines = [];

        lines.push('<table class="likert" data-id="' + data.name + '">');

        lines.push('<tr>');
        lines.push('<td></td>');

        for (var i = 0; i < options.length; i++) {
            var option = $.trim(options[i]);
            lines.push('<td><div class="likert-option">' + option + '</div></td>');
        }
        lines.push('</tr>');

        for (var i = 0; i < questions.length; i++) {
            var question = $.trim(questions[i]);
            if (question) {
                lines.push('<tr>');
                lines.push('<td><div class="likert-question">' + question + '</div></td>');

                for (var y = 0; y < options.length; y++) {
                    lines.push('<td class="likert-answer"><input type="radio" name="{{' + data.name + '[' + i + ']}}" value="' + options[y].trim() + '" /></td>');
                }

                lines.push('</tr>');
            }
        }

        lines.push('</table>');

        return lines.join('\n');
    }

    /**
     * Normalize ractive condition
     * @param  {string}  condition
     * @param  {string}  group         Group name
     * @param  {Boolean} isCalculated  If condition should have syntax of calculated expressions
     * @return {string}
     */
    function expandCondition(condition, group, isCalculated) {
        // Convert expression to computed
        return condition.replace(/("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\'])(\.?)(\w*[a-zA-z]\w*(?:[\.\w]+(?=[^\w(]|$))?)/g, function(match, str, prefix, scoped, keypath) {
            if (str) return match; // Just a string
            if (!scoped && globals.indexOf(keypath) !== -1) return match; // A global, not a keypath

            //Keypath
            var name = (scoped && group ? group + '.' : '') + keypath;
            if (isCalculated) name = '${' + name + '}';

            return prefix + ' ' + name;
        });
    }

    /**
     * Get computed vars for 'expression' field
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForExpression(name, step, field, data) {
        var computed = field.expression.replace(
            /("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\'])(\.?)(\w*[a-zA-z]\w*(?:[\.\w]+(?=[^\w(]|$))?)/g,
            function(match, str, prefix, scoped, keypath) {
                if (str) return match; // Just a string
                if (!scoped && globals.indexOf(keypath) > 0) return match; // A global, not a keypath
                return prefix + '${' + (scoped && step.group ? step.group + '.' : '') + keypath + '}';
            }
        );

        if (field.trim) computed = 'new String(' + computed + ').trim()';

        var key = name + '-expression';
        field.expression_field = key;
        data[key] = computed;
    }

    /**
     * Get computed vars for 'external_data' and 'external_source' fields
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForExternalUrls(name, step, field, data) {
        var urlName = name + '-url';
        var url = ltriToUrl(field.url);
        var vars = url.match(/\{\{[^}]+\}\}/g);
        field.url_field = urlName;

        if (vars) {
            for (var i = 0; i < vars.length; i++) {
                url = url.replace(vars[i], "' + " + vars[i] + " + '");
            }
        }

        url = "'" + url + "'";
        data[urlName] = url.replace(/\{\{\s*/g, '${').replace(/\s*\}\}/g, '}');
    }

    /**
     * Save conditions as computed properties
     * Add step condition to fields conditions, to reset all step fields when step is hidden
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForConditions(name, step, field, data) {
        if (((!field.conditions || field.conditions.length == 0) && (!step.conditions || step.conditions.length == 0)) || field.type === "expression") {
            delete field.conditions_field;
            return;
        }

        var key = name + '-conditions';
        field.conditions_field = key;

        var conditions = [];
        if (step.conditions && step.conditions.length > 0) conditions.push('(' + step.conditions + ')');
        if (field.conditions && field.conditions.length > 0) conditions.push('(' + field.conditions + ')');

        data[key] = expandCondition(conditions.join(' && '), step.group || '', true);
    }

    /**
     * Save defaults for amount field
     * @param {object} data   Object to save result to
     * @param {string} group  Group name
     * @param {object} field  Field data
     */
    function addAmountDefaults(data, group, field) {
        var fielddata = {
            amount: field.value !== '' ? field.value : "",
            unit: field.value == 1 ? field.optionValue[0] : field.optionText[0]
        };

        addGroupedData(data, group, field.name, fielddata);
    }

    /**
     * Create nested object for fields with dot notation in names
     * @param {object} data
     * @param {string} group  Group name
     * @param {string} name   Field name
     * @param {object} value
     * @return {object}
     */
    function addGroupedData(data, group, name, value) {
        var object = o = {};

        if (group) name = group + '.' + name;
        var names = name.split('.');

        for (var i = 0, c = names.length; i < c; i++){
            o[names[i]] = (i + 1 == c) ? value : {};
            o = o[names[i]];
        }

        $.extend(true, data, object);

        return data;
    }

    /**
     * Insert values into string
     * @param  {string} text
     * @return {string}
     */
    function strbind(text) {
        var i = 1, args = arguments;
        return text.replace(/%s/g, function(pattern) {
            return (i < args.length) ? args[i++] : "";
        });
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ltriToUrl;
}

/**
 * Translate an LTRI to a URL
 *
 * @param {string} url  LTRI or URL
 * @return {string}
 */
function ltriToUrl(url) {
    if (url.match(/^https?:\/\//)) return url;

    var base = $('head base').attr('href') || '/';
    var scheme = window.location.protocol + '//';
    var host = window.location.host;

    if (!base.match(/^(https?:)?\/\//)) {
        base = host + '/' + base.replace(/^\//, '');
    }

    url = url.replace('lt:', '');

    var auth = url.match(/^[^:\/@]+:[^:\/@]+@/);
    if (auth) {
        url = url.replace(auth[0], '');
        base = auth[0] + base;
    }

    url = url.replace(/^([a-z]+):(\/)?/, function(match, resource) {
        var start = resource === 'external' ? host : base.replace(/\/$/, '');

        return scheme + start + '/' + resource + '/';
    });

    return url;
}
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
            if (this.isCondition(keypath)) {
                this.onChangeCondition(newValue, oldValue, keypath);
                return;
            }

            this.updateExpressions(newValue, oldValue, keypath);

            setTimeout($.proxy(this.rebuildWizard, this), 200);
            setTimeout($.proxy(this.refreshLikerts, this), 0);
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
            }, 0);
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
         *
         * @param {string} key
         * @param {object} meta
         */
        initAmountField: function (key, meta) {
            var amount = this.get(key);
            if (!amount) return;

            var toString = function() {
                return (this.amount !== '' && this.amount !== null) ? this.amount + ' ' + this.unit : '';
            };

            defineProperty(amount, 'toString', toString);
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
                                return '<div style="pointer-events: none; color: #aaa;">' + escape(item.text) + '</div>';
                            }

                            return '<div>' + escape(item.text) + '</div>';
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
                var padding = 10;

                $('#doc-form').animate({scrollTop: pos + offset + offsetH1 + padding}, 500, 'swing', function() {
                    $('.form-scrollable').perfectScrollbar('update');
                });
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
            var today = moment();
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
/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
(function($) { 
    $.fn.toMaterial = function() {
        var $docWizard = $(this);
        
        // Add class to the material design to prevent another styles for it.
        $docWizard.addClass('material');

        // Added prev-next button to the each step
        var $wizardSteps = $docWizard.find('.wizard-step');

        $wizardSteps.each(function(index, value) {
            var $wizardForm = $('<div>').appendTo(this);
            $wizardForm.addClass('wizzard-form');
            $wizardForm.append($(this).find('form'));
            $wizardForm.append($(this).find('.wizards-actions'));
        });

        // Change checkboxes to the bootstrap material
        $docWizard.find('.form-group .option').each(function() {
            var $div = $(this);
            var type = 'radio';
            $div.addClass($div.find('input').attr('type'));
            $div.find('input').prependTo($div.find('label'));
        });

        // Change likert-view on bootstrap material
        $docWizard.find('.likert-answer').each(function(){
            var $div = $('<div>').appendTo(this).addClass('radio');
            var $label = $('<label>').appendTo($div);
            $(this).find('input').appendTo($label);
        });

        // Do all labels floating for nice view
        $docWizard.find('.form-group').addClass('label-floating');
        $docWizard.find('.form-group > label').addClass('control-label');

        if ($.material) {
            $.material.init();
        }
    };
})(jQuery);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unescapeDots;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function unescapeDots(keypath) {
    return typeof keypath === 'string' ? keypath.replace(/\\\./g, '.') : keypath;
}
