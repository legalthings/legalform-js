
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaInitFieldsTrait;
}

/**
 * Bulma init for some fields
 */
function BulmaInitFieldsTrait() {
    this.initDatePicker = function(elWizard, locale) {
        elWizard = new DomElement(elWizard);

        elWizard.findAll('[type="date"]').each(init); //do on page init, to convert date format from ISO
        elWizard.on('click', '[type="date"]', init); //do for fields, that were hidden on page init

        function init(e) {
            var input = this;
            if (input.element.bulmaCalendar) return;

            var yearly = input.attr('yearly');
            var format = yearly ? 'DD-MM' : 'DD-MM-YYYY';

            bulmaCalendar.attach(input.element, {
                type: 'date',
                lang: locale,
                dateFormat: format
            });
        }

        elWizard.on('click', '.datetimepicker-clear-button', function(e) {
            e.preventDefault();
        });
    }

    /**
     * Possible to use custom select
     */
    this.initSelect = function (elements, ractive) {
        if (elements instanceof DomElement) {
            elements = new DomList([elements]);
        } else if (elements instanceof NodeList) {
            elements = new DomList(elements);
        }

        elements.each(function() {
            var input = this;
            var name = input.attr('name');
            var choices = new Choices(input.element, {
                maxItemCount: 1,
                addItems: false,
                duplicateItemsAllowed: false,
                shouldSort: false
            }).enable();

            input.closest('.select').addClass('with-choices');

            input.on('choice', function(e) {
                ractive.set(name, e.detail.choice.value);
                ractive.validation.validateField(input);
                input.trigger('change');
            });

            input.on('blur', function(e) {
                if (typeof e.detail === 'undefined' || typeof e.detail.value === 'undefined') return;

                ractive.validation.validateField(input);
                input.trigger('change');
            });
        })

    };

    this.shouldRebuildSelect = function(element) {
        var element = new DomElement(element);

        return element.is('select') && !element.hasClass('choices__input');
    }
}
