function InitFieldsTrait($, jmespath) {
    /**
     * Use Robin Herbots Inputmask rather than Jasny Bootstrap inputmask
     */
    this.initInputmask = function() {
        if (typeof window.Inputmask === 'undefined') {
            return;
        }

        var ractive = this;
        var Inputmask = window.Inputmask;

        // disable inputmask jquery ui
        $(document).off('.inputmask.data-api');

        //Add jquery inputmask from Robin Herbots
        this.observe('*', function() {
            $('input[data-mask]').each(function () {
                var $origin = $(this);
                var name = $origin.attr('name');
                var mask = $origin.data('mask');

                if ($origin.data('masked')) return; // Mask already applied

                Inputmask({mask: mask, showMaskOnHover: false}).mask($origin);
                $origin.on('focusout', function(){
                    ractive.set(name, this.value);
                });

                $origin.data('masked', true);
            });
        }, {defer: true});
    };

    /**
     * Init date picker
     */
    this.initDatePicker = function () {
        var ractive = this;
        var $wizard = $(this.elWizard);

        $wizard.find('[data-picker="date"]').each(init); //do on page init, to convert date format from ISO
        $wizard.on('click', '[data-picker="date"]', init); //do for fields, that were hidden on page init

        function init(e) {
            var $inputGroup = $(this);
            if ($inputGroup.data('DateTimePicker')) return;

            var yearly = $inputGroup.find('input').attr('yearly');
            var format = yearly ? 'DD-MM' : 'DD-MM-YYYY';

            $inputGroup.datetimepicker({
                locale: ractive.getLocale('short'),
                format: format,
                extraFormats: ['YYYY-MM-DDTHH:mm:ssZ'], //Allow ISO8601 format for input
                dayViewHeaderFormat: yearly ? 'MMMM' : 'MMMM YYYY',

                //Allow arrow keys navigation inside date text field
                keyBinds: {
                    up: null,
                    down: function (widget) {
                        if (!widget) this.show();
                    },
                    left: null,
                    right: null,
                    t : null,
                    delete : null
                }
            });

            if (typeof e !== 'undefined') {
                $(e.target).closest('.input-group-addon').trigger('click');
            }
        }
    };

    /**
     * Initialize special field types
     */
    this.initField = function (key, meta) {
        if (meta.type === 'amount') {
            this.initAmountField(key, meta);
        } else if (meta.type === 'external_data') {
            this.initExternalData($.extend({name: key}, meta));
        } else if (meta.external_source) {
            this.initExternalSource($.extend({name: key}, meta));
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
    this.initSelectize = function (element) {
        var ractive = this;

        $(element).each(function() {
            var $select = $(this);
            var name = $select.attr('name');

            var selectize = $select.selectize({
                create: false,
                allowEmptyOption: true,
                render: {
                    option: function(item, escape) {
                        if (item.value === '' && $select.attr('required')) {
                            return '<div class="dropdown-item" style="pointer-events: none; color: #aaa;">' + escape(item.text) + '</div>';
                        }

                        return '<div class="dropdown-item">' + escape(item.text) + '</div>';
                    }
                },
                onChange: function(value) {
                    if (value !== '' && value !== null) {
                        $($select).parent().parent().addClass('is-filled');
                    }

                    ractive.set(name, value);
                    ractive.validation.validateField($select);
                    $($select).change();
                },
                onBlur: function() {
                    ractive.validation.validateField($select);
                    $($select).change();
                }
            });
        });
    };
}
