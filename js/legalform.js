function LegalForm($) {
    var self = this;

    if (typeof $ === 'undefined') {
        $ = window.jQuery;
    }

    this.attributes = {
        text: { type: 'text' },
        number: { type: 'text' },
        amount: { type: 'text' },
        money: { type: 'text', pattern: '\\d+(,\\d\\d)?' },
        date: { type: 'text', 'data-mask': '99-99-9999' },
        email: { type: 'email' },
        textarea: { rows: 3 }
    };

    this.build = function(definition) {
        var lines = [];
        lines.push('');
        
        $.each(definition, function(i, step) {
            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            lines.push('<div class="wizard-step"' + (step.article ? ' data-article="' + step.article + '"' : '') + '>');
            lines.push('<form class="form navmenu-form">');
            if (step.label) lines.push('<h3>' + step.label + '</h3>');

            $.each(step.fields, function(key, field) {
                lines.push(self.buildField( field, step.group || null, 'use'));
            });

            lines.push('</form>');
            lines.push('</div>');
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        });

        return lines.join('\n');
    }

    this.buildHelpText = function(definition) {
        var lines = [];
        var hasHelp = false;

        lines.push('');
        $.each(definition, function(i, step) {
            if (step.helptext) hasHelp = true;

            if (step.conditions) lines.push('{{# ' + step.conditions + ' }}');
            lines.push('<div class="help-step"' + (i == 0 ? ' style="display: block"' : '') + '>')
            if (step.helptext) lines.push($('<div class="help-step-text"></div>').html(step.helptext).wrapAll('<div>').parent().html());
            if (step.helptip) lines.push($('<div class="help-step-tip"></div>').text(step.helptip).wrapAll('<div>').parent().html().replace(/\n/g, '<br>'));
            lines.push('</div>');
            if (step.conditions) lines.push('{{/ ' + step.conditions + ' }}');
        });

        return hasHelp ? lines.join('\n') : '';
    }

    this.buildField = function(field, group, mode) {
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
        if (mode === 'build' && self.isFormEditable) {
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
                    .attr('data-title', $('<div>').text(data.helptext).html().replace(/\n/g, '<br>')
                )[0].outerHTML
            );
        }

        lines.push('</div>');
        if (mode === 'use' && data.conditions) lines.push('{{/ ' + expandCondition(data.conditions, group) + ' }}');

        return lines.join('\n');
    }

    function buildFieldInput(data, mode)
    {
        var excl = mode === 'build' ? 'data-mask;' : '';

        switch (data.type) {
            case 'number':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(.\\d{1,' + data.decimals + '})?') : '');
            case 'text':
            case 'email':
                return strbind('<input class="form-control" %s %s>', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type' + (mode === 'build' ? ';id' : '')));

            case 'amount':
                data.pattern = '\\d+' + (data.decimals > 0 ? ('(,\\d{1,' + data.decimals + '})?') : '');
                var input_amount = strbind('<input class="form-control" name="%s" value="%s" %s %s>', data.name + '.amount', mode === 'build' ?  data.value : '{{ ' + data.name + '.amount }}', attrString(self.attributes[data.type], excl), attrString(data, excl + 'type;id;name;value'));
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
                    data.value = data.optionValue ? '{{ ' + data.name + '.' + data.optionValue + ' }}' : '{{ ' + data.name + '.' + data.optionText + ' }}';
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
                return '<em>' + data.name.replace(/^.+?\./, '.') + '</em> = <em>' + ltriToUrl(data.url) + '</em>'
        }

        return '<strong>' + data.type + '</strong>';
    }

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

    function buildOption(type, data, extra, mode) {
        var lines = [];

        var keys = data.optionText || [data.text];
        var values = data.optionValue;

        if (data.optionsText && mode === 'use') data.name = data.value;

        for (var i = 0; i < keys.length; i++) {
            var key = $.trim(keys[i]);
            var value = values ? $.trim(values[i]) : null;

            if (key) {
                if (type === 'option') {
                    lines.push(strbind('<option value="%s">%s</option>', value, key));
                } else {
                    var attr = $.extend({type: type}, mode === 'use' ? (value === null ? {checked: data.value} : {name: data.value, value: value}) : {name: data.name});
                    lines.push(strbind('<div class="option"><label><input data-id="%s" %s %s %s/> %s</label></div>', data.name, attrString(data, 'id;name;value;type'), attrString(attr, false), attrString(extra, false), key));
                }
            }
        }

        return lines.join('\n');
    }

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

    function expandCondition(condition, group, isCalculated) {
        var globals = ['Array', 'Date', 'JSON', 'Math', 'NaN', 'RegExp', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'isFinite', 'isNaN', 'null', 'parseFloat', 'parseInt', 'undefined', 'true', 'false'];

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

    function strbind(text) {
        var i = 1, args = arguments;
        return text.replace(/%s/g, function(pattern) {
            return (i < args.length) ? args[i++] : "";
        });
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LegalForm;
}