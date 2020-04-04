
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BootstrapInitFieldsTrait;
}

/**
 * Bootstrap init for some fields
 */
function BootstrapInitFieldsTrait() {
    this.initDatePicker = function(elWizard, locale) {
        var $wizard = $(elWizard);

        $wizard.find('[data-picker="date"]').each(init); //do on page init, to convert date format from ISO
        $wizard.on('click', '[data-picker="date"]', init); //do for fields, that were hidden on page init

        function init(e) {
            var $inputGroup = $(this);
            if ($inputGroup.data('DateTimePicker')) return;

            var yearly = $inputGroup.find('input').attr('yearly');
            var format = yearly ? 'DD-MM' : 'DD-MM-YYYY';

            $inputGroup.datetimepicker({
                locale: locale,
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
    }

    /**
     * Change all selects to the selectize
     */
    this.initSelect = function (element, ractive) {
        $(element).each(function() {
            var select = this;
            var $select = $(this);
            var name = $select.attr('name');

            $select.attr('data-validate', 'false');

            var selectize = $select.selectize({
                create: false,
                allowEmptyOption: true,
                dropdownParent: 'body',
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
                    ractive.validation.validateField(select);
                    $($select).change();
                },
                onBlur: function() {
                    ractive.validation.validateField(select);
                    $($select).change();
                }
            });
        });
    };

    this.shouldRebuildSelect = function(input) {
        var $input = $(input);

        return $input.is('select') && !$input.hasClass('selectized');
    }
}
