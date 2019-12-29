
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalFormHtml;
    var cloner = require('./lib/cloner');
    var strbind = require('./lib/strbind');
    var attrString = require('./lib/attr-string');
    var ltriToUrl = require('./lib/ltri-to-url');
    var expandCondition = require('./lib/expand-condition');
    var FormModel = require('./model/form-model');
}

//Build form html from definition
function LegalFormHtml(variant) {
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
    this.disableRequiredFields = false;
    this.variant = variant;

    /**
     * Obtain wizard buttons html, for using custom buttons labels
     * @return {string}
     */
    this.getWizardButtonsHtml = function() {
        if (typeof document === 'undefined') return '';

        var dom = new Dom();
        var buttonsTemplate = '.wizards-actions.template';
        var template = dom.findOne(buttonsTemplate);

        if (!template.element) {
            var ractiveTemplate = dom.findOne('#ractive-template');
            if (!ractiveTemplate) return '';

            var tempDiv = dom.create('div');
            tempDiv.html(ractiveTemplate.html());
            template = tempDiv.findOne(buttonsTemplate);
        }

        return self.variant.setWizardButtonsClasses(template.html());
    }

    /**
     * Build form html
     * @param  {array} definition       Form definition
     * @param  {object} builderOptions  Additional options for buildong form html
     * @return {string}                 Form html
     */
    this.build = function(definition, builderOptions) {
        if (typeof builderOptions === 'undefined') builderOptions = {};

        self.disableRequiredFields = !!builderOptions.disableRequiredFields;
        self.model = (new FormModel(definition)).getModel();

        var lines = [];
        lines.push('');

        for (var i = 0; i < definition.length; i++) {
            var step = definition[i];
            var anchor = self.model.getStepAnchor(step);
            var buttonsHtml = self.getWizardButtonsHtml();
            var stepLines = [];

            stepLines.push('<form class="form navmenu-form">');

            for (var j = 0; j < step.fields.length; j++) {
                var field = step.fields[j];
                stepLines.push(self.buildField(field, step.group || null, 'use', false, step.repeater));
            }

            stepLines.push('</form>');
            stepLines.push('<div class="wizards-actions">');
            stepLines.push(buttonsHtml);
            stepLines.push('</div>'); // wizard actions

            var stepHtml = self.variant.wrapStep(stepLines.join('\n'), step.label, anchor);

            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            if (step.repeater) lines.push('{{#each ' + step.group + ' }}');
            lines.push(stepHtml);
            if (step.repeater) lines.push('{{/each ' + step.group + ' }}');
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        }

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
        for (var i = 0; i < definition.length; i++) {
            var step = definition[i];

            if (step.helptext) hasHelp = true;

            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            lines.push('<div class="help-step" style="display: ' + (i == 0 ? 'block' : 'none') + '">')
            if (step.helptext) lines.push('<div class="help-step-text">' + step.helptext + '</div>');
            if (step.helptip) lines.push('<div class="help-step-tip">' + step.helptip.replace(/\n/g, '<br>') + '</div>');
            lines.push('</div>');
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        }

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

        var data = cloner.shallow.copy(field);
        var label, input;

        var name = group ? group : '';
        if (repeater) name += '[{{ @index }}]';
        name += (name ? '.' : '') + data.name;

        self.model.syncValueField(data);
        data.id = 'field:' + name;
        data.name = name;
        data.nameNoMustache = name.replace('{{ @index }}', '@index');
        if (mode === 'use') data.value = '{{ ' + (repeater ? data.nameNoMustache : name) + ' }}';

        input = this.buildFieldInput(data, mode, group);
        if (input === null) return null;

        var lines = [];
        var type = self.model.getFieldType(data);
        var label = self.variant.buildLabel(type, data, mode);

        // Build HTML
        if (mode === 'build' && isFormEditable) {
            lines.push('<span class="delete close">&times;</span>');
            lines.push('<span class="copy fa fa-files-o">&nbsp;</span>');
        }

        if (label) lines.push(label);
        lines.push(input);

        if (mode === 'use' && data.helptext) {
            var help = data.helptext.replace(/\n/g, '<br>').replace(/"/g, '&quot;');
            lines.push(self.variant.buildTooltip(help));
        }

        var html = lines.join('\n');
        html = self.variant.wrapField(html, type);

        if (mode === 'use' && data.conditions) {
            var condition = expandCondition(data.conditions, group);
            html = '{{# ' +  condition + ' }}\n' + html + '\n{{/ ' + condition + ' }}';
        }

        return html;
    }

    /**
     * Create html input for form field
     * @param {object} data   Field data
     * @param {string} mode   'use' or 'build'
     * @param {string} group  Step group
     * @return {string}
     */
     this.buildFieldInput = function(data, mode, group) {
        var type = self.model.getFieldType(data);
        var attrs = typeof self.attributes[type] != 'undefined' ? cloner.shallow.copy(self.attributes[type]) : {};
        var excl = mode === 'build' ?
            'data-mask;' :
            (self.disableRequiredFields ? 'required;' : '');

        switch (type) {
            case 'number':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('([,.]\\d{1,' + data.decimals + '})?') : '');
            case 'password':
            case 'text':
            case 'email':
                return strbind(
                    self.variant.buildTextFieldTmpl(),
                    attrString(attrs, excl),
                    attrString(data, excl + 'type' + (mode === 'build' ? ';id' : ''))
                );

            case 'amount':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('([,.]\\d{1,' + data.decimals + '})?') : '');
                var units = self.model.getAmountUnits(data);

                return self.variant.buildAmountField(data, units, attrs, excl, mode);
            case 'date':
                if (mode === 'build' && data.today) data.value = moment().format('L');

                return strbind(
                    self.variant.buildDateFieldTmpl(data, attrs, mode),
                    mode === 'build' ? attrString({id: data.id}) : '',
                    attrString(attrs, excl),
                    attrString(data, excl + 'type;id')
                );
            case 'money':
                return strbind(
                    self.variant.buildMoneyFieldTmpl(),
                    mode === 'build' ? '&euro;' : '{{ valuta }}',
                    attrString(attrs),
                    attrString(data, excl + 'type' + (mode === 'build' ? ';id' : ''))
                );
            case 'textarea':
                return strbind(
                    self.variant.buildTextareaTmpl(),
                    attrString(attrs, excl),
                    attrString(data, excl + 'type' + (mode === 'build' ? ';id' : ''))
                );

            case 'select':
                var externalFieldType = self.variant.getExternalSelectFieldType();
                var buildSelect =
                    self.model.type === 'live_contract_form' ||
                    data.external_source !== 'true' ||
                    externalFieldType === 'select';

                data = cloner.shallow.copy(data);
                data.validate = 'false';

                if (data.external_source === 'true') {
                    data.value = '{{ ' + data.nameNoMustache + ' }}';
                    data.value_field = data.optionValue;
                    data.label_field = data.optionText;
                }

                if (buildSelect) {
                    var options = data.external_source === 'true' ?
                        '' : buildOption('option', data, null, mode, group);

                    return strbind(
                        self.variant.buildSelectTmpl(options),
                        attrString(data, excl + 'type' + (mode === 'build' ? ';id' : ''))
                    ) + (mode === 'build' ? '<span class="select-over"></span>' : '');
                }

            case 'external_select': //That also includes previous case for 'select', if it should be turned into input
                data.external_source = 'true';
                self.model.changeFieldType(data, 'text');

                return this.buildFieldInput(data, mode, group);

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
                var excl = 'id;name;value;type';

                if (mode === 'use') {
                    if (value === null) {
                        attrs.checked = data.value;
                    } else {
                        attrs.name = data.value;
                        attrs.value = value
                    }

                    if (self.disableRequiredFields) {
                        excl += ';required;';
                    }
                } else {
                    attrs.name = data.name;

                    var fieldType = self.model.getFieldType(data);
                    if (fieldType === 'group' && defaultValue !== null && defaultValue === value) {
                        attrs.checked = 'checked';
                    }
                }

                var optionHtml = strbind(
                    self.variant.buildFlagOptionTmpl(type),
                    data.name,
                    attrString(data, excl),
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
            var label = options[i].label.trim();
            lines.push('<td><div class="likert-option">' + label + '</div></td>');
        }
        lines.push('</tr>');

        for (var i = 0; i < questions.length; i++) {
            var question = questions[i].trim();
            if (!question) continue;

            lines.push('<tr>');
            lines.push('<td><div class="likert-question">' + question + '</div></td>');

            for (var y = 0; y < options.length; y++) {
                lines.push(self.variant.buildLikertAnswer(i, data.nameNoMustache, options[y].value.trim()));
            }

            lines.push('</tr>');
        }

        lines.push('</table>');

        return lines.join('\n');
    }
}
