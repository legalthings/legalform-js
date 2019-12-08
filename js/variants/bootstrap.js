/**
 * Bootstrap-specific implementation of some legalform-js methods
 */
function BootstrapVariant() {
    var self = this;

    this.initTooltip = function(element, show) {
        var $element = $(element);
        var inited = $element.data('bs.tooltip');

        if (!isset(inited)) {
            $element.tooltip({
                placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right',
                container: 'body'
            });
        }

        if (!inited || show) $element.tooltip('show');
    }

    this.isTooltipShown = function(help) {
        var tooltip = $(help).data('bs.tooltip');

        return isset(tooltip) && tooltip.$tip.hasClass('in');
    }

    this.hideTooltip = function(help) {
        var $help = $(help);
        var tooltip = $help.data('bs.tooltip');

        if (isset(tooltip) && tooltip.$tip.hasClass('in')) $help.tooltip('hide');
    }

    this.initFormValidator = function(form) {
        $(form).validator();
    }

    this.getFormValidator = function(form) {
        return $(form).data('bs.validator');
    }

    this.launchFormValidator = function(form) {
        $(form).validator('validate');
    }

    this.updateFormValidator = function(form) {
        $(form).validator('update');
    }

    this.isFormValidatorInvalid = function(form) {
        var validator = this.getFormValidator(form);

        return validator.isIncomplete() || validator.hasErrors();
    }

    this.initFormScroll = function() {
        $('.form-scrollable').perfectScrollbar();
    }

    this.updateFormScroll = function() {
        $('.form-scrollable').perfectScrollbar('update');
    }

    this.alert = function(status, message, callback) {
        if (typeof $.alert !== 'undefined') return $.alert(status, message, callback);

        if (status === 'error') status = 'danger';
        var $alert = $('<div class="alert alert-fixed-top">')
            .addClass('alert-' + status)
            .hide()
            .append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
            .append(message)
            .appendTo('body')
            .fadeIn();

        setTimeout(function() {
            $alert.fadeOut(function() {
                this.remove();
                if (callback)callback();
            });
        }, 3000);
    }

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

    function isset(tooltip) {
        return typeof tooltip !== 'undefined' && tooltip;
    }
}
