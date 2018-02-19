
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
    var ltriToUrl = require('./ltri-to-url');
}

function LegalForm($) {
    var self = this;
    var computedRegexp = /("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\'])(\.?)(\w*[a-zA-z]\w*(?:[\.\w]+(?=[^\w(]|$))?)/g;
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
        money: { type: 'text', pattern: '^(?:((?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d{2})?)|((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{2})?))$' },
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

            var buttonsTemplate = '.wizards-actions.template';
            var buttonsHtml = $(buttonsTemplate).length ?
                $(buttonsTemplate).html() :
                $( $('#ractive-template').html() ).find(buttonsTemplate).html();

            lines.push('</form>');
            lines.push('<div class="wizards-actions">');
            lines.push(buttonsHtml);
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
        if (input === null) return null;

        if (data.label) {
            label = (mode === 'build' ? '<label' : '<label for="' + data.id + '"') + (data.type === 'money' ? ' class="label-addon">' : '>') + data.label + '' + (data.required ? ' <span class="required">*</span>' : '') + '</label>';
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
                if (field.type === 'select' && !field.external_source) {
                    addGroupedData(data, step.group, field.name, '');
                } else if (field.type === 'group' && field.multiple) {
                    addGroupedData(data, step.group, field.name, []);
                } else if (typeof field.value !== 'undefined') {
                    var isComputed = field.value.indexOf('{{') !== -1;

                    if (field.type === 'amount') {
                        addAmountDefaults(data, step.group, field, isComputed);
                    } else if (!isComputed) {
                        addGroupedData(data, step.group, field.name, field.value);
                    }
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

                //Computed default value
                if (field.value && field.value.indexOf('{{') !== -1) {
                    setComputedForDefaults(name, step, field, data);
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
                    input_unit = '\n' + strbind('<div class="input-group-btn"><button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">%s </button>', mode === 'build' ? data.optionValue[0] : '{{ ' + data.name + '.unit }}') + '\n';
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
            lines.push('<option class="dropdown-item" value="" ' + (data.required ? 'disabled' : '') + '>&nbsp;</option>');
        }

        for (var i = 0; i < keys.length; i++) {
            var key = $.trim(keys[i]);
            var value = values ? $.trim(values[i]) : null;

            if (!key) continue;

            if (type === 'option') {
                lines.push(strbind('<option class="dropdown-item" value="%s">%s</option>', value, key));
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
        return condition.replace(computedRegexp, function(match, str, prefix, scoped, keypath) {
            if (str) return match; // Just a string
            if (!scoped && globals.indexOf(keypath) !== -1) return match; // A global, not a keypath

            //Keypath
            var name = (scoped && group ? group + '.' : '') + keypath;
            if (isCalculated) name = '${' + name + '}';

            return prefix + ' ' + name;
        });
    }

    /**
     * Get computed vars for 'value' field (e.g. default value)
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForDefaults(name, step, field, data) {
        var value = field.value;
        if (!value instanceof String) return;

        var computed = value.replace(/("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\']){{\s*(\.?)(\w[^}]*)\s*}}/g, function(match, str, prefix, scoped, keypath) {
                if (str) return match; // Just a string
                if (!scoped && globals.indexOf(keypath) > 0) return match; // A global, not a keypath
                return prefix + '${' + (scoped && step.group ? step.group + '.' : '') + keypath.trim() + '}';
            }
        );

        if (field.trim) computed = 'new String(' + computed + ').trim()';

        var key = name + '-default';
        data[key] = computed;
    }

    /**
     * Get computed vars for 'expression' field
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForExpression(name, step, field, data) {
        var computed = field.expression.replace(computedRegexp, function(match, str, prefix, scoped, keypath) {
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
    function addAmountDefaults(data, group, field, isComputed) {
        var value = isComputed ? "" :  //Real value will be set from calculated default field,
            (field.value !== '' ? field.value : "");

        var fielddata = {
            amount: value,
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
