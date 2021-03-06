function InitFieldsTrait() {
    /**
     * Use Robin Herbots Inputmask rather than Jasny Bootstrap inputmask
     */
    this.initInputmask = function() {
        if (typeof IMask === 'undefined') return;

        var ractive = this;

        this.observe('*', function() {
            ractive.elWizard.findAll('input[data-mask]').each(function() {
                if (this.hasClass('masked')) return;

                var name = this.attr('name');
                var mask = this.attr('data-mask').replace(/9/g, 0); //replace for BC
                var inputmask = IMask(this.element, {mask: mask});

                this.on('focusout', function(){
                    ractive.set(name, this.element.value);
                });

                this.addClass('masked');
            });
        }, {defer: true});
    };

    /**
     * Init date picker
     */
    this.initDatePicker = function () {
        var locale = this.getLocale('short');

        this.variant.initDatePicker(this.elWizard.element, locale);
    };

    /**
     * Initialize special field types
     */
    this.initField = function (key, meta) {
        if (meta.type === 'amount') {
            this.initAmountField(key, meta);
        } else if (meta.type === 'external_data') {
            this.initExternalData(cloner.shallow.merge({name: key}, meta));
        } else if (meta.external_source) {
            this.initExternalSource(cloner.shallow.merge({name: key}, meta));
        }
    };

    /**
     * Set toString method for amount value, which add the currency.
     * Also update current units, as they might have been changed when reloading builder,
     * and amount object was taken from previous ractive instance with old units
     *
     * @param {string} key
     * @param {object} meta
     */
    this.initAmountField = function (key, meta) {
        var value = this.get(key);

        var defaultObj = getByKeyPath(this.defaults, key, undefined);
        if (typeof defaultObj !== 'undefined') {
            setAmountToStringMethod(defaultObj);
        }

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

        setAmountToStringMethod(value);
        this.update(key);
    };

    /**
     * Change all selects to the selectize
     */
    this.initSelect = function (element) {
        this.variant.initSelect(element, this);
    }
}
