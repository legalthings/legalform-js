
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

        data.id = 'field:' + name;
        data.name = name;
        data.nameNoMustache = name.replace('{{ @index }}', '@index');
        if (mode === 'use') data.value = '{{ ' + (repeater ? data.nameNoMustache : name) + ' }}';

        input = buildFieldInput(data, mode);
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
     * @param  {object} data  Field data
     * @param  {string} mode  'use' or 'build'
     * @return {string}
     */
    function buildFieldInput(data, mode) {
        var excl = mode === 'build' ? 'data-mask;' : '';
        var type = self.model.getFieldType(data);

        switch (type) {
            case 'number':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(.\\d{1,' + data.decimals + '})?') : '');
            case 'password':
            case 'text':
            case 'email':
                return strbind('<input class="form-control" %s %s>', attrString(self.attributes[type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'amount':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(,\\d{1,' + data.decimals + '})?') : '');
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
                        + buildOption('option', data, null, mode)
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

                return buildFieldInput(data, mode);

            case 'group':
            case 'checkbox':
                var newType = type !== 'group' ? type : (data.multiple ? 'checkbox' : 'radio');
                return buildOption(newType, data, self.attributes[type], mode);

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
     * @return {string}
     */
    function buildOption(type, data, extra, mode) {
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
            var key = options[i].label;
            var value = options[i].value;

            if (!key) continue;

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

                var option = strbind(
                    '<div class="option"><label><input data-id="%s" %s %s %s/> %s</label></div>',
                    data.name,
                    attrString(data, 'id;name;value;type'),
                    attrString(attrs, false),
                    attrString(extra, false),
                    key
                );

                lines.push(option);
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
        var likertData = self.model.getLikertData(data);
        var questions = likertData.keys;
        var options = likertData.values;
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
                    lines.push('<td class="likert-answer"><input type="radio" name="{{' + data.nameNoMustache + '[' + i + ']}}" value="' + options[y].trim() + '" /></td>');
                }

                lines.push('</tr>');
            }
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
