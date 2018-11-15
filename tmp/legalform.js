(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LegalForm = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

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

                if (type === 'date') {
                    var dateLimits = self.model.getDateLimits(field);
                    $.extend(meta, dateLimits);

                    meta.yearly = !!(typeof field.yearly !== 'undefined' && field.yearly);
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

},{"./lib/calculation-vars":4,"./lib/expand-condition":5,"./lib/ltri-to-url":6,"./model/form-model":7}],2:[function(require,module,exports){

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

        var type = self.model.getFieldType(data);
        if (type !== 'checkbox' && data.label) {
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

                var attrs = $.extend({}, self.attributes[type]);
                if (data.yearly) attrs['data-mask'] = '99-99';

                return strbind('<div class="input-group" %s %s><input class="form-control" %s %s><span class="input-group-addon"><span class="fa fa-calendar"></span></span></div>', mode === 'build' ? '' : 'data-picker="date"' , mode === 'build' ? attrString({id: data.id}) : '', attrString(attrs, excl), attrString(data, excl + 'type;id'));

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
                return buildOption(type, data, self.attributes[type], mode, group);

            case 'checkbox':
                //For old fields, that were stored using text as label
                if (typeof data.text !== 'undefined') data.label = data.text;

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

        if (type === 'checkbox' && data.required) {
            data.label += ' <span class="required">*</span>';
        }

        var defaultValue = typeof data.value !== 'undefined' ? data.value : null;
        var options = type === 'checkbox' ?
            [{label: data.label, value: null}] :
            self.model.getListOptions(data);

        if (data.optionsText && mode === 'use') data.name = data.value;

        if (type === 'group') {
            type = data.multiple ? 'checkbox' : 'radio';
        } else if (type === 'option') {
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

},{"./lib/expand-condition":5,"./lib/ltri-to-url":6,"./model/form-model":7}],3:[function(require,module,exports){

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
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

},{"./legalform-calc":1,"./legalform-html":2}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){

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

},{"./calculation-vars":4}],6:[function(require,module,exports){

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

    var baseElement = document.querySelector('head base');
    var base = baseElement ? baseElement.getAttribute('href') : null;
    base = base || '/';

    var scheme = window.location.protocol + '//';
    var host = window.location.host;

    base = base.replace(/service\/[a-z]+\//, 'service/');

    if (!base.match(/^(https?:)?\/\//)) {
        base = host + '/' + base.replace(/^\//, '');
    }

    if (url.match('lt:')) {
        url = url.replace('lt:', '');
        
        if (typeof legalforms !== 'undefined') {
            host = legalforms.base_url.replace(/https?:\/\//, '');
        }
    }
    
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

},{}],7:[function(require,module,exports){
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

},{"./legalform-model":8,"./live-contract-form-model":9}],8:[function(require,module,exports){
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

    this.getDateLimits = function(field) {
        return {
            min_date: field.min_date,
            max_date: field.max_date
        };
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

},{}],9:[function(require,module,exports){
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

    this.getDateLimits = function(field) {
        return {};
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

},{}]},{},[3])(3)
});
