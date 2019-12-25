function OnChangeTrait(jmespath) {
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
    this.onChangeLegalForm = function (newValue, oldValue, keypath) {
        this.variant.onChange();

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

        setTimeout(this.rebuildWizard.bind(this), 200);
        setTimeout(this.refreshLikerts.bind(this), 10);
    };

    /**
     * Observe changes and receive exact keypath and value of property that was changed (even if it is nested in object)
     * Do not use this for all changes handling, because computed properties are not always passed here when changed
     *
     * @param  {mixed} newValue
     * @param  {mixed} oldValue
     * @param  {string} keypath
     */
    this.onChangeLegalFormRecursive = function(newValue, oldValue, keypath) {
        var ractive = this;
        var isComputed = this.isComputed(keypath);

        if (isComputed) return;

        this.onChangeAmount(newValue, oldValue, keypath);

        var isEmpty = newValue === null ||
            newValue === undefined ||
            (typeof(newValue) === 'string' && !newValue.trim().length); //consider evalueted expressions, that have only spaces, as empty

        //Avoid expression turning into a string like 'null null undefined', when expression members equall null or undefined
        if (isEmpty) ractive.set(keypath, '');
    };

    /**
     * Handle conditions change in some special cases
     *
     * @param          newValue (not used)
     * @param          oldValue (not used)
     * @param {string} keypath
     */
    this.onChangeCondition = function(newValue, oldValue, keypath) {
        var name = unescapeDots(keypath.replace(this.suffix.conditions, ''));
        var selector = '#doc-wizard [name="' + name + '"]';
        var input = this.dom.findOne(selector);

        if (!newValue && oldValue !== undefined) {
            var set = getByKeyPath(this.defaults, name, undefined);

            if (typeof set === 'undefined') {
                set = '';
            } else if (isObject(set)) {
                set = cloner.shallow.copy(set);
            }

            // Set field value to empty/default if condition is not true
            this.set(name, set);

            var meta = this.get('meta.' + name);
            if (meta.type === 'amount') {
                this.initAmountField(name, meta);
            }
        } else {
            var rebuild = this.variant.shouldRebuildSelect(input.element);
            if (rebuild) this.initSelect(input);
        }

        var form = input.closest('.wizard-step form');
        this.validation.updateFormValidator(form);
    };

    /**
     * If default value of field is presented as calculated expression, use it to update real field value
     *
     * @param  {mixed} newValue
     * @param  {mixed} oldValue
     * @param  {string} keypath
     */
    this.onChangeComputedDefault = function(newValue, oldValue, keypath) {
        var ractive = this;
        var name = unescapeDots(keypath.replace(this.suffix.defaults, ''));
        if (Number.isNaN(newValue)) newValue = null;

        var repeated = this.handleDefaultChangeInRepeatedStep(name, newValue);
        if (repeated) return;

        var isAmount = this.get(name + this.suffix.amount) !== undefined;
        var setName = isAmount ? name + this.suffix.amount : name;

        //We loaded document with initialy set values (for ex. in case when editing existing document)
        if ((Number.isNaN(oldValue) || oldValue === undefined) && this.get(setName)) return;

        //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
        setTimeout(function() {
            ractive.set(setName, newValue);

            if (newValue) {
                var selector = '#doc-wizard [name="' + name + '"]';
                var input = ractive.dom.findOne(selector);

                input.closest('is-empty').removeClass('is-empty');
            }
        }, 10);
    };

    /**
     * Handle change of amount options from singular to plural, and backwords.
     * @param  {mixed} newValue
     * @param  {mixed} oldValue
     * @param  {string} keypath
     */
    this.onChangeAmount = function(newValue, oldValue, keypath) {
        var key = keypath.replace(/\.amount$/, '');
        var meta = this.get('meta.' + key);
        var isAmount = typeof meta !== 'undefined' &&
            typeof meta.plural !== 'undefined' &&
            typeof meta.singular !== 'undefined';

        if (!isAmount) return;

        var oldOptions = meta[newValue == 1 ? 'plural' : 'singular'];
        var newOptions = meta[newValue == 1 ? 'singular' : 'plural'];
        var index = oldOptions ? oldOptions.indexOf(this.get(key + '.unit')) : -1;

        if (newOptions && index !== -1) this.set(key + '.unit', newOptions[index]);
    };

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
    this.updateExpressions = function(newValue, oldValue, keypath) {
        var ractive = this;
        var name = unescapeDots(keypath.replace(this.suffix.expression, ''));

        //Use timeout because of some ractive bug: expressions, that depend on setting key, may be not updated, or can even cause an error
        setTimeout(function() {
            ractive.set(name, newValue);
        }, 10);
    };

    /**
     * Handle selecting a value through the dropdown
     */
    this.handleChangeDropdown = function() {
        var ractive = this;
        var wizard = this.dom.findOne('.wizard');

        wizard.on('click', '.dropdown', function(e) {
            e.preventDefault();

            var className = 'is-active';
            this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
        });

        wizard.on('click', '.dropdown-menu a', function() {
            var name = this.closest('.dropdown-menu').attr('data-name');

            ractive.set(name, this.text());
        });
    };

    /**
     * Handle picking a date using the date picker
     */
    this.handleChangeDate = function() {
        var ractive = this;

        this.dom.findOne('.wizard').on('dp.change', function(e) {
            var input = e.target.findOne('input');
            var name = input.attr('name');

            ractive.updateModel(name);
        });
    };

    /**
     * Show / hide likert questions
     */
    this.refreshLikerts = function() {
        this.dom.findAll('.likert').each(function() {
            var likert = this;

            this.findAll('.likert-question').each(function(index) {
                var empty = this.text() === '';
                this.closest('tr')[empty ? 'hide' : 'show']();

                if (index === 0) {
                    likert.parent()[empty ? 'hide' : 'show']();
                }
            });
        });
    };

    /**
     * Remove empty list items from content, or show hidden non-empty
     *
     * @param {string} action
     */
    this.refreshListItems = function(action) {
        this.dom.findAll('#doc-content li').each(function() {
            var li = this;

            if(li.text().length === 0) {
                action === 'remove' ? li.remove() : li.hide();
            } else if(action !== 'remove' && li.text().length !== 0) {
                li.show();
            }
        });
    };
}
