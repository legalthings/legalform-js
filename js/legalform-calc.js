
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
                if (typeof(field.value) !== 'string') return;

                var isComputed = field.value.indexOf('{{') !== -1;

                if (field.type === 'amount') {
                    addAmountDefaults(data, step.group, field, isComputed);
                } else if (!isComputed) {
                    var value = field.value;
                    if (field.type === 'group' && field.multiple) value = [value];

                    addGroupedData(data, step.group, field.name, value);
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
     * Get computed vars for 'value' field (e.g. default value)
     * @param {string} name   Field name
     * @param {object} step   Step data
     * @param {object} field  Field data
     * @param {object} data   Object to save result to
     */
    function setComputedForDefaults(name, step, field, data) {
        var value = field.value;
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
}
