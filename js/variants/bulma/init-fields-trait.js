
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
    this.initSelect = function (element, ractive) {

    };

    this.shouldRebuildSelect = function(input) {
        return false;
    }
}
