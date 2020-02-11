if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapMaterialBuildFormTrait;

    var strbind = require('../../lib/strbind');
    var attrString = require('../../lib/attr-string');
}

/**
 * Build form fields
 */
function BootstrapMaterialBuildFormTrait() {
    this.wrapStep = function(stepHtml, label, anchor, parentMethod) {
        var stepHtml = `<div class="wizzard-form">\n${stepHtml}</div>`;

        return parentMethod(stepHtml, label, anchor);
    }

    this.buildLabel = function(fieldType, data, mode) {
        if (fieldType === 'checkbox' || !data.label) return null;

        var moneyClass = fieldType === 'money' ? 'label-addon' : '';

        var label =
            (mode === 'build' ? '<label' : '<label for="' + data.id + '"') +
            ` class="form-control-label bmd-label-static ${moneyClass}">` +
            data.label +
            (data.required ? ' <span class="required">*</span>' : '') +
            '</label>';

        return label;
    }

    this.wrapField = function(html) {
        return '<div class="form-group bmd-form-group" data-role="wrapper">\n' + html + '\n</div>';
    }

    this.buildFlagOptionTmpl = function(type) {
        var checkboxDecorator = type === 'checkbox' ? '<span class="checkbox-decorator"><span class="check"></span></span>' : '';

        return `<div class="option ${type}"><label><input data-id="%s" %s %s %s/>${checkboxDecorator} %s</label></div>`;
    }

    this.buildLikertAnswer = function(idx, name, value) {
        return `<td class="likert-answer"><div class="radio"><label><input type="radio" name="{{${name}[${idx}]}}" value="${value}" /></label></div></td>`;
    }
}
