function RepeatedStepsTrait() {
    /**
     * Expressions used in repeated steps
     */
    this.repeatedStepExpressions = {};

    /**
     * Handle change in default field, if it's computed and belongs to repeated step
     * @param  {string} name
     * @param  {mixed} newValue
     * @return {boolean}
     */
    this.handleDefaultChangeInRepeatedStep = function(name, newValue) {
        var parts = this.splitFieldName(name);
        if (!parts.group) return false;

        var group = parts.group;
        var field = parts.field;

        var repeaterName = escapeDots(group + this.suffix.repeater);
        var repeater = this.get(repeaterName);
        if (typeof repeater === 'undefined') return false;

        var tmpl =
            typeof this.defaults[group] !== 'undefined' &&
            typeof this.defaults[group][0] !== 'undefined' ?
                this.defaults[group][0] : {};

        var isAmount = typeof tmpl[field + this.suffix.amount] !== 'undefined';
        field = isAmount ? field + this.suffix.amount : field;

        var prevDefault = tmpl[field];
        tmpl[field] = newValue;
        this.defaults[group] = [tmpl];

        var ractive = this;
        var steps = this.get(group);

        if (Array.isArray(steps)) {
            //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
            setTimeout(function() {
                for (var i = 0; i < steps.length; i++) {
                    var key = group + '.' + i + '.' + field;
                    var current = ractive.get(key);

                    if (current && current !== prevDefault) continue;

                    ractive.set(key, newValue);

                    if (newValue) {
                        var selector = '#doc-wizard [name="' + key + '"]';
                        var input = ractive.dom.findOne(selector);

                        input.parent().removeClass('is-empty');
                    }
                }
            }, 10);
        }

        return true;
    };

    /**
     * Split field name into step name and field name.
     * Theoretically step name can consists of any amount of parts, splited with dots,
     *   so we can't just use first part of name up untill first dot.
     *
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    this.splitFieldName = function(name) {
        var result = {group: null, field: name};
        if (name.indexOf('.') === -1) return result;

        name = name.replace('\\.', '.');
        var parts = name.split('.');
        var field = parts.pop();
        var group = parts.join('.');

        while (true) {
            var meta = this.get('meta.' + group);

            if (typeof meta !== 'undefined' && typeof meta.type === 'undefined') {
                result.group = group;
                result.field = field;

                return result;
            }

            if (parts.length) {
                field = parts.pop() + '.' + field;
                group = parts.join('.');
            } else {
                return result;
            }
        }
    };

    /**
     * When step repeater is changed, update number of step instances
     * @param  {string} newValue
     * @param  {string} oldValue
     * @param  {string} keypath
     */
    this.updateRepeatedStep = function(newValue, oldValue, keypath) {
        var ractive = this;
        var name = unescapeDots(keypath.replace(this.suffix.repeater, ''));
        var value = ractive.get(name);
        var repeater = newValue;
        var stepCount = value.length;

        var tmpl =
            typeof this.defaults[name] !== 'undefined' &&
            typeof this.defaults[name][0] !== 'undefined' ?
                this.defaults[name][0] : {};

        if (!repeater && stepCount) {
            this.removeRepeatedStepExpression(name, 0, stepCount);
            value.length = 0;
        } else if (repeater < stepCount) {
            this.removeRepeatedStepExpression(name, repeater, stepCount);
            value = value.slice(0, repeater);
        } else if (repeater > stepCount) {
            var addLength = repeater - stepCount;
            for (var i = 0; i < addLength; i++) {
                var newItem = cloner.deep.copy(tmpl);
                value.push(newItem);
            }
        }

        this.addRepeatedStepExpression(name, 0, value.length);

        ractive.set(name, value);

        var meta = ractive.get('meta');
        var valueMeta = meta[name];
        var length = value.length ? value.length : 1;
        meta[name] = Array(length).fill(valueMeta[0]);

        ractive.set('meta', meta);
    };

    /**
     * Save repeated step expression tmpl to cache on ractive init
     * @param  {string} keypath
     * @param  {string} expressionTmpl
     */
    this.cacheExpressionTmpl = function(keypath, expressionTmpl) {
        var parts = keypath.split('.0.');
        if (parts.length !== 2) return; // Step is not repeatable (shouldn't happen) or has nested arrays (can't be, just in case)

        var group = parts[0];
        var field = parts[1];
        var cache = this.repeatedStepExpressions;

        if (typeof cache[group] === 'undefined') cache[group] = {};
        cache[group][field] = expressionTmpl;
    };

    /**
     * Create computed expression dynamically for repeated step
     * @param  {string} group
     * @param  {int} fromStepIdx
     * @param  {int} stepCount
     */
    this.addRepeatedStepExpression = function(group, fromStepIdx, stepCount) {
        var expressionTmpls = this.repeatedStepExpressions[group];
        if (typeof expressionTmpls === 'undefined' || !expressionTmpls) return;

        for (var idx = fromStepIdx; idx < stepCount; idx++) {
            var prefix = group + '[' + idx + ']';

            for (var key in expressionTmpls) {
                var keypath = prefix + '.' + key + this.suffix.expression;
                var value = this.get(keypath);

                if (typeof value !== 'undefined') continue;

                var tmpl = expressionTmpls[key];
                var expression = tmplToExpression(tmpl, group, idx);
                this.ractiveDynamicComputed.add(this, keypath, expression);
            }
        }
    };

    /**
     * Remove computed expressions for repeated steps
     * @param  {string} group
     * @param  {int} fromStepIdx
     * @param  {int} stepCount
     */
    this.removeRepeatedStepExpression = function(group, fromStepIdx, stepCount) {
        var expressionTmpls = this.repeatedStepExpressions[group];
        if (typeof expressionTmpls === 'undefined' || !expressionTmpls) return;

        for (var idx = fromStepIdx; idx < stepCount; idx++) {
            var prefix = group + '[' + idx + ']';

            for (var key in expressionTmpls) {
                var keypath = prefix + '.' + key + this.suffix.expression;
                this.ractiveDynamicComputed.remove(this, keypath);
            }
        }
    };
}
