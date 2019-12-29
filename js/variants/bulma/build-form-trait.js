if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaBuildFormTrait;

    var strbind = require('../../lib/strbind');
    var attrString = require('../../lib/attr-string');
}

/**
 * Build form fields
 */
function BulmaBuildFormTrait() {
    this.wrapStep = function(stepHtml, label, anchor) {
        return '<div class="wizard-step"' + (anchor ? ' data-article="' + anchor + '"' : '') + '>\n' +
                (label ? '<h3>' + label + '</h3>\n' : '') +
                stepHtml +
            '</div>';
    }

    this.buildLabel = function(fieldType, data, mode) {
        if (fieldType === 'checkbox' || fieldType === 'radio' || !data.label) return null;

        var label =
            (mode === 'build' ? '<label' : '<label for="' + data.id + '"') +
            'class="label">' +
            data.label +
            (data.required ? ' <span class="required">*</span>' : '') +
            '</label>';

        return label;
    }

    this.wrapField = function(html, type) {
        var addon = ['amount', 'money'].indexOf(type) !== -1 ? 'has-addons' : '';

        return `<div class="field ${addon}" data-role="wrapper">\n${html}\n</div>`;
    }

    this.buildTextFieldTmpl = function() {
        return '<div class="control"><input class="input" %s %s></div>';
    }

    this.buildAmountField = function(data, units, attrs, excl, mode) {
        var input_unit;
        var input_amount = strbind(
            '<div class="control is-expanded"><input class="input" name="%s" value="%s" %s %s %s></div>',
            data.name + '.amount',
            mode === 'build' ? (data.value || '') : '{{ ' + data.nameNoMustache + '.amount }}',
            mode === 'build' ? attrString({id: data.id}) : '',
            attrString(attrs, excl),
            attrString(data, excl + 'type;id;name;value')
        );

        if (units.length === 1) {
            input_unit = strbind('<div class="control"><a class="button is-static">%s</a></div>', mode === 'build' ? units[0].singular : '{{ ' + data.nameNoMustache + '.unit }}');
        } else {
            var buttonHtml =
                `<div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span>%s</span>
                        <span class="icon is-small">
                            <i class="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </button>
                </div>`;

            input_unit = '\n' + strbind(buttonHtml, mode === 'build' ? units[0].singular : '{{ ' + data.nameNoMustache + '.unit }}') + '\n';
            if (mode === 'use') {
                input_unit += strbind(
                    `<div class="dropdown-menu" role="menu" data-name="%s">
                        <div class="dropdown-content">
                            {{# %s.amount == 1 ? meta.%s.singular : meta.%s.plural }}<a href="javascript:;" class="dropdown-item">{{ . }}</a>{{/ meta }}
                        </div>
                    </div>`,
                    data.name + '.unit',
                    data.nameNoMustache,
                    data.nameNoMustache,
                    data.nameNoMustache
                );
            }

            input_unit = `<div class="dropdown">${input_unit}</div>\n`;
        }

        return strbind(input_amount + input_unit);
    }

    this.buildDateFieldTmpl = function(data, attrs, mode) {
        delete attrs['data-mask'];

        if (mode === 'use') attrs.type = 'date';

        return `<input %s %s %s>`;
    }

    this.buildMoneyFieldTmpl = function() {
        return '<div class="control"><a class="button is-static">%s</a></div><div class="control is-expanded"><input class="input" %s %s></div>';
    }

    this.buildTextareaTmpl = function() {
        return '<div class="control"><textarea class="textarea" %s %s></textarea></div>';
    }

    this.buildSelectTmpl = function(options) {
        return `<div class="control">
                    <div class="select is-fullwidth">
                        <select %s>
                            ${options}
                        </select>
                    </div>
                </div>`;
    }

    this.getExternalSelectFieldType = function() {
        return 'select';
    }

    this.buildFlagOptionTmpl = function(fieldType) {
        return `<label class="${fieldType}"><input data-id="%s" %s %s %s> %s</label>`;
    }

    this.buildLikertAnswer = function(idx, name, value) {
        return `<td class="likert-answer"><label class="radio"><input type="radio" name="{{${name}[${idx}]}}" value="${value}" /></label></td>`;
    }

    this.setWizardButtonsClasses = function(html) {
        if (!html) return '';

        var dom = new Dom();
        var tempDiv = dom.create('div');

        tempDiv.html(html);
        tempDiv.findOne('[data-step="prev"]').addClass('button', 'is-pulled-left');
        tempDiv.findOne('[data-step="next"]').addClass('button', 'is-primary', 'is-pulled-right');
        tempDiv.findOne('[data-step="done"]').addClass('button', 'is-success', 'is-pulled-right');

        return tempDiv.html();
    }

    this.buildTooltip = function(help) {
        return '<span class="help has-tooltip-multiline" rel="tooltip" data-tooltip="' + help + '"><strong>?</strong></span>'
    }
}
