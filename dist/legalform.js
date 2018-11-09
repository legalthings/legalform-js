
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalFormCalc;
    var ltriToUrl = require('./lib/ltri-to-url');
    var expandCondition = require('./lib/expand-condition');
    var calculationVars = require('./lib/calculation-vars');
    var FormModel = require('./model/form-model');
}

//Calculate form values from definition
function LegalFormCalc($) {
    var self = this;
    var computedRegexp = calculationVars.computedRegexp;
    var globals = calculationVars.globals;

    this.model = null;

    /**
     * Calculate form data based on definition
     * @param  {array} definition  Form definition
     * @return {object}
     */
    this.calc = function(definition) {
        self.model = (new FormModel(definition)).getModel();

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
                var type = self.model.getFieldType(field);
                var value = self.model.getFieldValue(field);
                var isComputed = typeof(value) === 'string' && value.indexOf('{{') !== -1;

                if (type === 'amount') {
                    addAmountDefaults(data, step.group, field, isComputed);
                } else if (!isComputed) {
                    if (self.model.type === 'live_contract_form' && type === 'checkbox') {
                        value = self.model.isCheckboxFieldChecked(field);
                    } else if (value === null) {
                        value = ''; //prevent evaluating expressions like 'null null undefined', if it's members are empty
                    }

                    if (type === 'group' && field.multiple) {
                        value = typeof(value) !== 'undefined' ? [value] : [];
                    }

                    addGroupedData(data, step.group, field.name, value);
                }
            });

            //Turn step into array of steps, if repeater is set
            if (step.repeater) {
                data[step.group] = data[step.group] ? [data[step.group]] : [];
            }
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
                var type = self.model.getFieldType(field);
                var value = self.model.getFieldValue(field);

                if (field.validation) {
                    data[name + '-validation'] = expandCondition(field.validation, step.group || '', true);
                }

                if (type === 'expression') {
                    setComputedForExpression(name, step, field, data);
                } else if (type === 'external_data' || field.external_source) {
                    setComputedForExternalUrls(name, step, field, data);
                }

                //Computed default value
                if (typeof(value) === 'string' && value.indexOf('{{') !== -1) {
                    setComputedForDefaults(name, step, field, data);
                }

                setComputedForConditions(name, step, field, data);
            });

            if (step.repeater) {
                setComputedForRepeater(step, data);
            }
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
                var type = self.model.getFieldType(field);
                var meta = { type: type, validation: field.validation };

                if (field.today) meta.default = 'today';
                if (field.conditions_field) meta.conditions_field = field.conditions_field;

                if (type === 'amount') {
                    var units = self.model.getAmountUnits(field, true);
                    meta.singular = units.singular;
                    meta.plural = units.plural;
                }

                if (field.external_source) {
                    var use = ['external_source', 'url', 'headerName', 'headerValue', 'conditions', 'url_field', 'jmespath', 'autoselect'];

                    for (var i = 0; i < use.length; i++) {
                        meta[use[i]] = field[use[i]];
                    }
                }

                if (type === 'external_data') {
                    var use = ['jmespath', 'url', 'headerName', 'headerValue', 'conditions', 'url_field'];

                    for (var i = 0; i < use.length; i++) {
                        meta[use[i]] = field[use[i]];
                    }
                }

                addGroupedData(data, step.group, field.name, meta);
            });

            //Turn step meta into array, if repeater is set
            if (step.repeater) {
                data[step.group] = data[step.group] ? [data[step.group]] : [];
            }
        });

        return data;
    }

    /**
     * Set computed vars for 'repeater' property of step
     * @param {object} step  Step properties
     * @param {object} data  Object to save result to
     */
    function setComputedForRepeater(step, data) {
        if (!step.group) {
            throw 'Step should have a group, if it has repeater';
        }

        var computed = step.repeater.replace(computedRegexp, function(match, str, prefix, scoped, keypath) {
                if (str) return match; // Just a string
                if (!scoped && globals.indexOf(keypath) > 0) return match; // A global, not a keypath
                return prefix + '${' + (scoped && step.group ? step.group + '.' : '') + keypath + '}';
            }
        );

        var key = step.group + '-repeater';
        data[key] = computed;
    }

    /**
     * Get computed vars for 'value' field (e.g. default value)
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForDefaults(name, step, field, data) {
        var value = self.model.getFieldValue(field);
        if (typeof(value) !== 'string') return;

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
        var type = self.model.getFieldType(field);

        if (['select', 'group'].indexOf(type) !== -1) {
            setComputedForOptionsConditions(name, step, field, data);
        }

        if (((!field.conditions || field.conditions.length == 0) && (!step.conditions || step.conditions.length == 0)) || type === "expression") {
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
     * Save conditions for 'select' and 'group' options as computed properties
     * @param {string} name  Field name
     * @param {object} step  Step data
     * @param {object} field Field data
     * @param {object} data  Object to save result to
     */
    function setComputedForOptionsConditions(name, step, field, data) {
        var options = self.model.getListOptions(field);
        if (!options) return;

        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (typeof option.condition === 'undefined') continue;

            var key = name + '-condition-option';
            data[key] = expandCondition(option.condition, step.group || '', true);
        }
    }

    /**
     * Save defaults for amount field
     * @param {object} data   Object to save result to
     * @param {string} group  Group name
     * @param {object} field  Field data
     */
    function addAmountDefaults(data, group, field, isComputed) {
        var value = self.model.getFieldValue(field);
        var units = self.model.getAmountUnits(field);
        var amount = isComputed ? "" :  //Real value will be set from calculated default field,
            (value !== null ? value : "");

        var fielddata = {
            amount: amount,
            unit: value == 1 ? units[0].singular : units[0].plural
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
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalFormHtml;
    var ltriToUrl = require('./lib/ltri-to-url');
    var expandCondition = require('./lib/expand-condition');
    var FormModel = require('./model/form-model');
}

//Build form html from definition
function LegalFormHtml($) {
    var self = this;

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

    this.model = null;

    /**
     * Build form html
     * @param  {array} definition  Form definition
     * @return {string}            Form html
     */
    this.build = function(definition) {
        self.model = (new FormModel(definition)).getModel();

        var lines = [];
        lines.push('');

        $.each(definition, function(i, step) {
            var anchor = self.model.getStepAnchor(step);

            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            if (step.repeater) lines.push('{{#each ' + step.group + ' }}');
            lines.push('<div class="wizard-step"' + (anchor ? ' data-article="' + anchor + '"' : '') + '>');
            if (step.label) lines.push('<h3>' + step.label + '</h3>');
            lines.push('<form class="form navmenu-form">');

            $.each(step.fields, function(key, field) {
                lines.push(self.buildField( field, step.group || null, 'use', false, step.repeater));
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
            if (step.repeater) lines.push('{{/each ' + step.group + ' }}');
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
        if (!self.model) self.model = (new FormModel(definition)).getModel();

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
     * @param  {string} repeater        Step repeater value
     * @return {string}                 Field html
     */
    this.buildField = function(field, group, mode, isFormEditable, repeater) {
        if (!self.model) self.model = (new FormModel(field)).getModel();

        var data = $.extend({}, field);
        var lines = [];
        var label, input;

        var name = group ? group : '';
        if (repeater) name += '[{{ @index }}]';
        name += (name ? '.' : '') + data.name;

        self.model.syncValueField(data);
        data.id = 'field:' + name;
        data.name = name;
        data.nameNoMustache = name.replace('{{ @index }}', '@index');
        if (mode === 'use') data.value = '{{ ' + (repeater ? data.nameNoMustache : name) + ' }}';

        input = buildFieldInput(data, mode, group);
        if (input === null) return null;

        if (data.label) {
            var type = self.model.getFieldType(data);
            label = (mode === 'build' ? '<label' : '<label for="' + data.id + '"') + (type === 'money' ? ' class="label-addon">' : '>') + data.label + '' + (data.required ? ' <span class="required">*</span>' : '') + '</label>';
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
     * Create html input for form field
     * @param {object} data   Field data
     * @param {string} mode   'use' or 'build'
     * @param {string} group  Step group
     * @return {string}
     */
    function buildFieldInput(data, mode, group) {
        var excl = mode === 'build' ? 'data-mask;' : '';
        var type = self.model.getFieldType(data);

        switch (type) {
            case 'number':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('([,.]\\d{1,' + data.decimals + '})?') : '');
            case 'password':
            case 'text':
            case 'email':
                return strbind('<input class="form-control" %s %s>', attrString(self.attributes[type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'amount':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('([,.]\\d{1,' + data.decimals + '})?') : '');
                var input_amount = strbind('<input class="form-control" name="%s" value="%s" %s %s>', data.name + '.amount', mode === 'build' ? (data.value || '') : '{{ ' + data.nameNoMustache + '.amount }}', attrString(self.attributes[type], excl), attrString(data, excl + 'type;id;name;value'));
                var units = self.model.getAmountUnits(data);
                var input_unit;

                if (units.length === 1) {
                    input_unit = strbind('<span class="input-group-addon">%s</span>', mode === 'build' ? units[0].singular : '{{ ' + data.nameNoMustache + '.unit }}');
                } else {
                    input_unit = '\n' + strbind('<div class="input-group-btn"><button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">%s </button>', mode === 'build' ? units[0].singular : '{{ ' + data.nameNoMustache + '.unit }}') + '\n';
                    if (mode === 'use') {
                        input_unit += strbind('<ul class="dropdown-menu pull-right dropdown-select" data-name="%s" role="menu">', data.name + '.unit') + '\n'
                        input_unit += '{{# %s.amount == 1 ? meta.%s.singular : meta.%s.plural }}<li><a>{{ . }}</a></li>{{/ meta }}'.replace(/%s/g, data.nameNoMustache) + '\n';
                        input_unit += '</ul>' + '\n'
                    }
                    input_unit += '</div>' + '\n';
                }

                return strbind('<div class="input-group" %s>' + input_amount + input_unit + '</div>', mode === 'build' ? attrString({id: data.id}) : '');

            case 'date':
                if (mode === 'build' && data.today) data.value = moment().format('L');
                return strbind('<div class="input-group" %s %s><input class="form-control" %s %s><span class="input-group-addon"><span class="fa fa-calendar"></span></span></div>', mode === 'build' ? '' : 'data-picker="date"' , mode === 'build' ? attrString({id: data.id}) : '', attrString(self.attributes[type], excl), attrString(data, excl + 'type;id'));

            case 'money':
                return strbind('<div class="input-group"><span class="input-group-addon">%s</span><input class="form-control" %s %s></div>', mode === 'build' ? '&euro;' : '{{ valuta }}', attrString(self.attributes[type]), attrString(data, 'type' + (mode === 'build' ? ';id' : '')))

            case 'textarea':
                return strbind('<textarea class="form-control" %s %s></textarea>', attrString(self.attributes[type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'select':
                if (self.model.type === 'live_contract_form' || data.external_source !== "true") {
                    return strbind('<select class="form-control" %s >', attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')))
                        + '\n'
                        + buildOption('option', data, null, mode, group)
                        + '</select>'
                        + (mode === 'build' ? '<span class="select-over"></span>' : '');
                }

            case 'external_select': //That also includes previous case for 'select', if data.external_source === "true"
                data = $.extend({}, data);
                data.value = '{{ ' + data.nameNoMustache + ' }}';
                data.value_field = data.optionValue;
                data.label_field = data.optionText;
                data.external_source = 'true';
                self.model.changeFieldType(data, 'text');

                return buildFieldInput(data, mode, group);

            case 'group':
                var newType = data.multiple ? 'checkbox' : 'radio';
                return buildOption(newType, data, self.attributes[type], mode, group);

            case 'checkbox':
                return buildOption(type, data, self.attributes[type], mode, group);

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

        return '<strong>' + type + '</strong>';
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
            exclude += ';label;keys;values;conditions;text;optionValue;optionText;optionSelected;options;helptext;$schema;nameNoMustache';
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
     * @param  {string} group  Step group
     * @return {string}
     */
    function buildOption(type, data, extra, mode, group) {
        var lines = [];

        var defaultValue = typeof data.value !== 'undefined' ? data.value : null;
        var options = data.text ?
            [{label: data.text, value: null}] :
            self.model.getListOptions(data);

        if (data.optionsText && mode === 'use') data.name = data.value;

        if (type === 'option') {
            lines.push('<option class="dropdown-item" value="" ' + (data.required ? 'disabled' : '') + '>&nbsp;</option>');
        }

        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var condition = option.condition ? expandCondition(option.condition, group) : null;
            var key = option.label;
            var value = option.value;

            if (!key) continue;
            if (condition) lines.push('{{# ' + condition + ' }}');

            if (type === 'option') {
                var selected = defaultValue !== null && defaultValue === value;
                lines.push(strbind('<option class="dropdown-item" value="%s" ' + (selected ? 'selected' : '') + '>%s</option>', value, key));
            } else {
                var attrs = {type: type};

                if (mode === 'use') {
                    var more = value === null ? {checked: data.value} : {name: data.value, value: value};
                    attrs = $.extend(attrs, more);
                } else {
                    attrs = $.extend(attrs, {name: data.name});

                    var fieldType = self.model.getFieldType(data);
                    if (fieldType === 'group' && defaultValue !== null && defaultValue === value) {
                        attrs.checked = 'checked';
                    }
                }

                var optionHtml = strbind(
                    '<div class="option"><label><input data-id="%s" %s %s %s/> %s</label></div>',
                    data.name,
                    attrString(data, 'id;name;value;type'),
                    attrString(attrs, false),
                    attrString(extra, false),
                    key
                );

                lines.push(optionHtml);
            }

            if (condition) lines.push('{{/ ' + condition + ' }}');
        }

        return lines.join('\n');
    }

    /**
     * Build html for likert questions set
     * @param  {object} data
     * @return {string}
     */
    function buildLikert(data) {
        var likertData = self.model.getLikertData(data);
        var questions = likertData.keys;
        var options = likertData.options;
        var lines = [];

        lines.push('<table class="likert" data-id="' + data.name + '">');

        lines.push('<tr>');
        lines.push('<td></td>');

        for (var i = 0; i < options.length; i++) {
            var label = $.trim(options[i].label);
            lines.push('<td><div class="likert-option">' + label + '</div></td>');
        }
        lines.push('</tr>');

        for (var i = 0; i < questions.length; i++) {
            var question = $.trim(questions[i]);
            if (!question) continue;

            lines.push('<tr>');
            lines.push('<td><div class="likert-question">' + question + '</div></td>');

            for (var y = 0; y < options.length; y++) {
                lines.push('<td class="likert-answer"><input type="radio" name="{{' + data.nameNoMustache + '[' + i + ']}}" value="' + options[y].value.trim() + '" /></td>');
            }

            lines.push('</tr>');
        }

        lines.push('</table>');

        return lines.join('\n');
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
            this.initOnDone();
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
         * Initialize the bootstrap validation for the forms
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

            $(this.elWizard).on('step.bs.wizard', '', $.proxy(function(e) {
                if (e.direction === 'back' || ractive.get('validation_enabled') === false) return;

                var $stepForm = $(self.el).find('.wizard-step.active form');
                var validator = $stepForm.data('bs.validator');

                validator.update();
                validator.validate();

                $stepForm.find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                    self.validateField(this);
                    $(this).change();
                });

                if (validator.isIncomplete() || validator.hasErrors()) {
                    e.preventDefault();
                }
            }));
        };

        /**
         * Initialize validation on done event
         */
        this.initOnDone = function() {
            var ractive = this.ractive;
            var self = this;

            $(this.elWizard).on('done.bs.wizard', '', $.proxy(function(e) {
                if (ractive.get('validation_enabled') === false) return;

                var valid = validateAllSteps(self);

                valid ?
                    $(self.el).trigger('done.completed') :
                    e.preventDefault();
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

            var data = this.getFieldData(name);
            var meta = data.meta;
            name = data.name;

            if (!meta) {
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
                var number = parseNumber(value);
                var min = parseNumber($(input).attr('min'));
                var max = parseNumber($(input).attr('max'));

                var valid = $.isNumeric(number) && (!$.isNumeric(min) || value >= min) && (!$.isNumeric(max) || value <= max);
                if (!valid) {
                    $(input).get(0).setCustomValidity(error);
                    return;
                }
            }
            // Implement validation for dates
            if (meta.type === 'date') {
                var valid = moment(value, 'DD-MM-YYYY', true).isValid();
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
        function validateAllSteps(validation) {
            var toIndex = null;
            var elWizard = validation.elWizard;

            $(elWizard).find('.wizard-step form').each(function(key, step) {
                var validator = $(this).data('bs.validator');

                validator.update();
                validator.validate();

                $(this).find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                    validation.validateField(this);
                    $(this).change();
                });

                var invalid = validator.isIncomplete() || validator.hasErrors();
                if (invalid) {
                    toIndex = key;
                    return false;
                }
            });

            if (toIndex === null) return true;

            $(elWizard).wizard(toIndex + 1);
            $('.form-scrollable').perfectScrollbar('update');

            return false;
        }
    }

    window.LegalFormValidation = LegalFormValidation;
})(jQuery);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
    var ltriToUrl = require('./lib/ltri-to-url');
    var LegalFormHtml = require('./legalform-html');
    var LegalFormCalc = require('./legalform-calc');
}

function LegalForm($) {
    if (typeof $ === 'undefined') {
        $ = window.jQuery;
    }

    /**
     * Build form html
     * @param  {array} definition  Form definition
     * @return {string}            Form html
     */
    this.build = function(definition) {
        var handler = new LegalFormHtml($);
        return handler.build(definition);
    }

    /**
     * Calculate form data based on definition
     * @param  {array} definition  Form definition
     * @return {object}
     */
    this.calc = function(definition) {
        var handler = new LegalFormCalc($);
        return handler.calc(definition);
    }

    /**
     * Build form help html
     * @param  {array} definition  Form definition
     * @return {string}            Form help text html
     */
    this.buildHelpText = function(definition) {
        var handler = new LegalFormHtml($);
        return handler.buildHelpText(definition);
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
        var handler = new LegalFormHtml($);
        return handler.buildField(field, group, mode, isFormEditable);
    }
}

var calculationVars = {
    globals: [
        'Array', 'Date', 'JSON', 'Math', 'NaN', 'RegExp', 'decodeURI', 'decodeURIComponent', 'true', 'false',
        'encodeURI', 'encodeURIComponent', 'isFinite', 'isNaN', 'null', 'parseFloat', 'parseInt', 'undefined'
    ],
    computedRegexp: /("(?:[^"\\]+|\\.)*"|'(?:[^'\\]+|\\.)*')|(^|[^\w\.\)\]\"\'])(\.?)(\w*[a-zA-z]\w*(?:[\.\w\[\]]+(?=[^\w(]|$))?)/g
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = calculationVars;
}

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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = expandCondition;
    var calculationVars = require('./calculation-vars');
}

/**
 * Normalize ractive condition
 * @param  {string}  condition
 * @param  {string}  group         Group name
 * @param  {Boolean} isCalculated  If condition should have syntax of calculated expressions
 * @return {string}
 */
function expandCondition(condition, group, isCalculated) {
    var computedRegexp = calculationVars.computedRegexp;
    var globals = calculationVars.globals;

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

(function($) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = ltriToUrl;
    }

    if (typeof window !== 'undefined') {
        window.ltriToUrl = ltriToUrl;
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

        base = base.replace(/service\/[a-z]+\//, 'service/');

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
})(jQuery);
// Use default date for moment
moment.fn.toString = function() {
    if (typeof this.defaultFormat === 'undefined') return this.toDate().toString();
    return this.format(this.defaultFormat);
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = parseNumber;
}

var numberRegexp = new RegExp('^(?:((?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d{1,})?)|((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{1,})?))$');
var dotRegexp = /\./g;
var commaRegexp = /,/g;

/**
 * Create float number from number, given by string with decimal comma/dot
 * @param {string} number
 * @return {float|null}
 */
function parseNumber(number) {
    if (typeof number === 'undefined' || number === null) return null;

    number = number.toString();
    var match = number.match(numberRegexp);
    if (!match) return null;

    var isDecimalComma = typeof match[1] !== 'undefined';

    number = isDecimalComma ?
        number.replace(dotRegexp, '').replace(',', '.') :
        number.replace(commaRegexp, '');

    return parseFloat(number);
}
/**
 * Change the HTML to Bootstrap Material.
 *
 * @param $docWizard
 */
(function($) {
    $.fn.toMaterial = function() {
        if (!$.fn.bootstrapMaterialDesign) {
            return;
        }

        var $docWizard = $(this);

        // Add class to the material design to prevent another styles for it.

        if (typeof $docWizard.attr('class') !== 'undefined' && $docWizard.attr('class').indexOf('wizard-step') === -1) {
            $docWizard.addClass('material');
        }

        // Do all labels floating for nice view
        $docWizard.find('.form-group').addClass('bmd-form-group');
        $docWizard.find('.form-group > label').addClass('form-control-label bmd-label-static');

        // Make all inputs a form control
        $docWizard.find('.form-group > input').addClass('form-control');
        $docWizard.find('.selectize-input > input').addClass('form-control');

        // Added prev-next button to the each step
        var $wizardSteps = $docWizard.find('.wizard-step');

        $wizardSteps.each(function(index, value) {
            if (!$(this).children('.wizzard-form').length) {
                var $wizardForm = $('<div>').appendTo(this);
                $wizardForm.addClass('wizzard-form');
                $wizardForm.append($(this).find('form'));
                $wizardForm.append($(this).find('.wizards-actions'));
            }
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
            if (!$(this).children('.radio').length) {
                var $div = $('<div>').appendTo(this).addClass('radio');
                var $label = $('<label>').appendTo($div);
                $(this).find('input').appendTo($label);
            }
        });

        // Add bootstrap material checkbox buttons to option lists that are shown on condition
        $docWizard.find('.checkbox > label').each(function() {
            const input = $(this);

            if (input.length > 0 && !input.find('.checkbox-decorator').length) {
                const text = input.text();
                var outerCircle = $('<span class="bmd-radio-outer-circle"></span>');
                var cbElement = $('<span class="checkbox-decorator"><span class="check"></span></span>');
                $(this).prepend(cbElement);
            }
        });

        // Add bootstrap material radio buttons to option lists that are shown on condition
        $docWizard.find('.radio > label').each(function(){
            if($(this).children('.bmd-radio-outer-circle').length > 1) {
                $(this).children('.bmd-radio-outer-circle').get(0).remove();
                $(this).children('.bmd-radio-inner-circle').get(0).remove();
            }
            if(!$(this).children('.bmd-radio-outer-circle').length) {
                var outerCircle = $('<span class="bmd-radio-outer-circle"></span>');
                var innerCircle = $('<span class="bmd-radio-inner-circle"></span>');
                $(this).prepend(innerCircle);
                $(this).prepend(outerCircle);
            }
        });

        $docWizard.bootstrapMaterialDesign({ autofill: false });
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
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormModel;
    var LiveContractFormModel = require('./live-contract-form-model');
    var LegalFormModel = require('./legalform-model');
}

//Get needed type of model to work with given form schema
function FormModel(definition) {
    var modelType = determineModelType(definition);
    var model = modelType === 'legal_form' ?
        new LegalFormModel() :
        new LiveContractFormModel();

    this.getModel = function() {
        return model;
    };

    function determineModelType(definition) {
        //Definition is a single field
        if (!Array.isArray(definition)) {
            return definition.$schema ? 'live_contract_form' : 'legal_form';
        }

        //Definition
        var modelType = 'legal_form';

        for (var i = 0; i < definition.length; i++) {
            var fields = definition[i].fields;
            if (!fields || !fields.length) continue;

            if (fields[0].$schema) modelType = 'live_contract_form';
            break;
        }

        return modelType;
    }
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalFormModel;
}

//Methods to work with legalform schema
function LegalFormModel() {
    this.type = 'legal_form';

    this.getFieldType = function(field) {
        return field.type;
    };

    this.changeFieldType = function(field, type) {
        field.type = type;
    }

    this.getStepAnchor = function(step) {
        return step.article;
    };

    this.getAmountUnits = function(field, split) {
        return split ?
            {singular: field.optionValue, plural: field.optionText} :
            buildOptions(field, 'singular', 'plural');
    };

    this.getListOptions = function(field) {
        return buildOptions(field, 'value', 'label');
    };

    this.getFieldValue = function(field) {
        return field.value;
    };

    this.getLikertData = function(field) {
        var keys = splitLikertItems(field.keys);
        var values = splitLikertItems(field.values);
        var options = [];

        for (var i = 0; i < values.length; i++) {
            options.push({value: values[i], label: values[i]});
        }

        return {
            keys: keys,
            options: options
        };
    };

    //This is just a stub for legalform model
    this.syncValueField = function(field) {

    };

    //Checkbox can not be set to checked by default
    this.isCheckboxFieldChecked = function(field) {
        return false;
    };

    function splitLikertItems(items) {
        return items.trim().split("\n").map(function(value) {
            return value.trim();
        });
    }

    function buildOptions(field, keyName, valueName) {
        var options = [];

        if (!field.optionValue) {
            return options;
        }

        for (var i = 0; i < field.optionValue.length; i++) {
            var item = {};
            item[keyName] = field.optionValue[i];
            item[valueName] = field.optionText[i];

            options.push(item);
        }

        return options;
    }
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LiveContractFormModel;
}

//Methods to work with live contract form schema
function LiveContractFormModel() {
    var typeReg = /#[^#]+$/;
    this.type = 'live_contract_form';

    this.getFieldType = function(field) {
        var map = {'select-group' : 'group'};
        var schema = field.$schema;
        var type = schema.substring(
            schema.lastIndexOf('#') + 1
        );

        return typeof map[type] !== 'undefined' ? map[type] : type;
    };

    this.changeFieldType = function(field, type) {
        field.$schema = field.$schema.replace(typeReg, '#' + type);
    }

    this.getStepAnchor = function(step) {
        return step.anchor;
    };

    this.getAmountUnits = function(field, split) {
        if (!split) return field.options;

        var singular = [];
        var plural = [];

        for (var i = 0; i < field.options.length; i++) {
            var option = field.options[i];

            singular.push(option.singular);
            plural.push(option.plural);
        }

        return {
            singular: singular,
            plural: plural
        };
    };

    this.getListOptions = function(field) {
        return field.options;
    };

    this.getFieldValue = function(field) {
        return field.default;
    };

    this.getLikertData = function(field) {
        return {
            keys: field.keys,
            options: field.options
        }
    };

    //This is used when working with copy of field data, so not with original form definition
    //Used when building form html
    this.syncValueField = function(field) {
        if (typeof(field.default) === 'undefined') return;

        field.value = field.default;
        delete field.default;
    };

    this.isCheckboxFieldChecked = function(field) {
        return !!field.checked;
    };
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
            defaults: '-default',
            repeater: '-repeater',
            external_url: '-url',
            validation: '-validation',
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
            this.observe('**', $.proxy(this.onChangeLegalFormRecursive, this), {defer: true});
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
         * So if any non-computed field is changed, change event will be triggered for whole step object
         * Actual names and values would be passed only for computed properties.
         *
         * @param          newValue (not used)
         * @param          oldValue (not used)
         * @param {string} keypath
         */
        onChangeLegalForm: function (newValue, oldValue, keypath) {
            if ($(this.el).hasClass('material')) {
                $('#doc-wizard').toMaterial();
                $('.wizard-step.active').toMaterial();
            }

            if (newValue === oldValue) {
                return;
            }

            if (this.isCondition(keypath)) {
                this.onChangeCondition(newValue, oldValue, keypath);
            } else if (this.isDefault(keypath)) {
                this.onChangeComputedDefault(newValue, oldValue, keypath);
            } else if (this.isExpression(keypath)) {
                this.updateExpressions(newValue, oldValue, keypath);
            } else if (this.isRepeater(keypath)) {
                this.updateRepeatedStep(newValue, oldValue, keypath);
            }

            setTimeout($.proxy(this.rebuildWizard, this), 200);
            setTimeout($.proxy(this.refreshLikerts, this), 10);
        },

        /**
         * Observe changes and receive exact keypath and value of property that was changed (even if it is nested in object)
         * Do not use this for all changes handling, because computed properties are not always passed here when changed
         *
         * @param  {mixed} newValue
         * @param  {mixed} oldValue
         * @param  {string} keypath
         */
        onChangeLegalFormRecursive: function(newValue, oldValue, keypath) {
            var ractive = this;
            var isComputed = this.isComputed(keypath);

            if (isComputed) return;

            var isEmpty = newValue === null ||
                newValue === undefined ||
                (typeof(newValue) === 'string' && !newValue.trim().length); //consider evalueted expressions, that have only spaces, as empty

            //Avoid expression turning into a string like 'null null undefined', when expression members equall null or undefined
            if (isEmpty) ractive.set(keypath, '');
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
            var $input = $(input);

            if (!newValue && oldValue !== undefined) {
                var set = getByKeyPath(this.defaults, name, undefined);

                if (typeof set === 'undefined') {
                    set = '';
                } else if ($.type(set) === 'object') {
                    set = $.extend({}, set);
                }

                // Set field value to empty/default if condition is not true
                this.set(name, set);

                var meta = this.get('meta.' + name);
                if (meta.type === 'amount') {
                    this.initAmountField(name, meta);
                }
            } else {
                var rebuild = $input.is('select') && !$input.hasClass('selectized');
                if (rebuild) this.initSelectize(input);
            }

            var validator = $input.closest('.wizard-step form').data('bs.validator');
            if (validator) validator.update();
        },

        /**
         * If default value of field is presented as calculated expression, use it to update real field value
         *
         * @param  {mixed} newValue
         * @param  {mixed} oldValue
         * @param  {string} keypath
         */
        onChangeComputedDefault: function(newValue, oldValue, keypath) {
            var ractive = this;
            var name = unescapeDots(keypath.replace(this.suffix.defaults, ''));
            var isAmount = this.get(name + this.suffix.amount) !== undefined;
            var setName = isAmount ? name + this.suffix.amount : name;

            //We loaded document with initialy set values (for ex. in case when editing existing document)
            if ((Number.isNaN(oldValue) || oldValue === undefined) && this.get(setName)) return;
            if (Number.isNaN(newValue)) newValue = null;

            //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
            setTimeout(function() {
                ractive.set(setName, newValue);
            }, 10);
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
            var ractive = this;
            var name = unescapeDots(keypath.replace(this.suffix.expression, ''));

            //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
            setTimeout(function() {
                ractive.set(name, newValue);
            }, 10);
        },

        /**
         * When step repeater is changed, update number of step instances
         * @param  {string} newValue
         * @param  {string} oldValue
         * @param  {string} keypath
         */
        updateRepeatedStep: function(newValue, oldValue, keypath) {
            var ractive = this;
            var name = unescapeDots(keypath.replace(this.suffix.repeater, ''));
            var value = ractive.get(name);
            var repeater = newValue;
            var stepCount = value.length;

            if (!repeater) value.length = 0;
            else if (repeater < stepCount) value = value.slice(0, repeater);
            else if (repeater > stepCount) {
                var addLength = repeater - stepCount;
                for (var i = 0; i < addLength; i++) {
                    value.push({});
                }
            }

            ractive.set(name, value);

            var meta = ractive.get('meta');
            var valueMeta = meta[name];
            var length = value.length ? value.length : 1;
            meta[name] = Array(length).fill(valueMeta[0]);

            ractive.set('meta', meta);
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

            if (value.amount === '') {
                //Set default value
                var defaultValue = this.get(key + this.suffix.defaults);
                if (typeof defaultValue !== 'undefined') {
                    var units = this.get('meta.' + key + '.' + (defaultValue == 1 ? 'singular' : 'plural'));
                    this.set(key + this.suffix.amount, defaultValue);
                    this.set(key + '.unit', units[0]);

                    value.amount = defaultValue;
                }
            }

            //Set units, if they were changed from previous bilder session
            var meta = this.get('meta.' + key);
            var newUnits = value.amount == 1 ? meta.singular : meta.plural;
            if (newUnits.indexOf(value.unit) === -1) {
                value.unit = newUnits[0];
            }

            if (!value.hasOwnProperty('toString')) {
                //Set toString method
                var toString = function() {
                    return (this.amount !== '' && this.amount !== null) ? this.amount + ' ' + this.unit : '';
                };

                defineProperty(value, 'toString', toString);
            }

            this.update(key);
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
                    onChange: function(value) {
                        if (value !== '' && value !== null) {
                            $($select).parent().parent().addClass('is-filled');
                        }

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

            $(this.elWizard).on('click', '.wizard-step > h3', function(e) {
                e.preventDefault();

                var $toStep = $(this).closest('.wizard-step');
                var index = $(ractive.el).find('.wizard-step').index($toStep);

                $(ractive.el).find('.wizard-step form').each(function(key, step) {
                    if (key >= index) return false;

                    var $stepForm = $(this);
                    var validator = $stepForm.data('bs.validator');

                    validator.update();
                    validator.validate();

                    $stepForm.find(':not(.selectize-input)>:input:not(.btn)').each(function() {
                        ractive.validation.validateField(this);
                        $(this).change();
                    });

                    var invalid = (validator.isIncomplete() || validator.hasErrors()) && index > key;
                    if (invalid) {
                        index = key;
                        return false;
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
                } else if (article && $('.article[data-reference="' + article + '"]').length){
                    $scrollElement = $('.article[data-reference="' + article + '"]');
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

            return $.extend(true, {}, this.defaults, this.values, globals, {meta: this.meta}, this.functions);
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
         * Determine if keypath belongs to computed property
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isComputed: function(keypath) {
            return this.isCondition(keypath) ||
                this.isDefault(keypath) ||
                this.isExpression(keypath) ||
                this.isExternalUrl(keypath) ||
                this.isValidation(keypath) ||
                this.isRepeater(keypath);
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
        },

        /**
         * Determine if keypath belongs to default variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isDefault: function(keypath) {
            return endsWith(keypath, this.suffix.defaults);
        },

        /**
         * Determine if keypath belongs to repeater variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isRepeater: function(keypath) {
            return endsWith(keypath, this.suffix.repeater);
        },

        /**
         * Determine if keypath belongs to computed external url variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isExternalUrl: function(keypath) {
            return endsWith(keypath, this.suffix.external_url);
        },

        /**
         * Determine if keypath belongs to validation variable
         * @param  {string}  keypath
         * @return {Boolean}
         */
        isValidation: function(keypath) {
            return endsWith(keypath, this.suffix.validation);
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
        var index = keypath.indexOf(suffix);

        return index !== -1 && index === keypath.length - suffix.length;
    }

    /**
     * Remove placeholders of empty values (e.g. 'null', 'undefined') in computed external url
     * @return {string}
     */
    function clearComputedUrl(url) {
        return url.replace(/=(undefined|null)\b/g, '=');
    }
})(jQuery, Ractive, jmespath);
