/**
 * Base ractive engine class
 * @param {object} $
 * @param {object} jmespath
 */
function RactiveLegalFormEngine($, jmespath) {
    var traits = [
        new InitFieldsTrait($, jmespath),
        new InitExernalFieldsTrait($, jmespath),
        new InitPreviewSwitchTrait($, jmespath),
        new OnChangeTrait($, jmespath),
        new RepeatedStepsTrait($, jmespath),
        new WizardTrait($, jmespath),
        new KeypathTypeTrait($, jmespath),
        new HelperTrait($, jmespath),
    ];

    // Attach methods and properties from traits
    for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];

        for (var property in trait) {
            this[property] = trait[property];
        }
    }

    /**
     * Wizard DOM element
     */
    this.elWizard = null;

    /**
     * Current locale
     */
    this.locale = 'en_US';

    /**
     * Number of steps in the wizard
     */
    this.stepCount = null;

    /**
     * Validation service
     */
    this.validation = null;

    /**
     * Called by Ractive on initialize, before template is rendered
     */
    this.oninit = function() {
        this.initLegalForm();
    };

    /**
     * Initialize Ractive for LegalForm
     */
    this.initLegalForm = function() {
        this.set(this.getValuesFromOptions());
        this.observe('*', $.proxy(this.onChangeLegalForm, this), {defer: true});
        this.observe('**', $.proxy(this.onChangeLegalFormRecursive, this), {defer: true});
    };

    /**
     * Method that is called when Ractive is complete
     */
    this.oncomplete = function () {
        this.completeLegalForm();
    };

    /**
     * Apply complete for LegalForm
     */
    this.completeLegalForm = function () {
        this.handleChangeDropdown();
        this.handleChangeDate();
        this.initSelectize($(this.el).find('select'));

        this.initWizard();
        $('.form-scrollable').perfectScrollbar();

        this.initDatePicker();
        this.initInputmask();
        this.initPreviewSwitch();
        this.refreshLikerts();

        metaRecursive(this.get('meta'), $.proxy(this.initField, this));

        this.on('complete', function() {
            $('#doc').trigger('shown.preview');
        })
    };

    /**
     * Get values from options, applying defaults
     *
     * @returns {object}
     */
    this.getValuesFromOptions = function() {
        var ractive = this;

        // default date
        moment.locale(this.locale);
        var today = moment().format("L");
        today.defaultFormat = "L";

        // Set correct defaults for dates
        metaRecursive(this.meta, function(key, meta) {
            if (meta.default === 'today') {
                setByKeyPath(ractive.defaults, key, today);
            } else if (meta.type === "date") {
                setByKeyPath(ractive.defaults, key, "");
            } else if (meta.type === 'expression' && typeof meta.expressionTmpl !== 'undefined') {
                ractive.cacheExpressionTmpl(key, meta.expressionTmpl);
            }
        });

        var globals = {
            vandaag: today,
            today: today,
            currency: '€',
            valuta: '€'
        };

        return $.extend(true, {}, this.defaults, this.values, globals, {meta: this.meta}, this.functions);
    };

    /**
     * Get values that should replace ractive values
     */
    this.getRewriteValues = function() {
        var values = {};

        $(this.elWizard).find('[data-picker="date"]').each(function() {
            var $inputGroup = $(this);
            var $input = $inputGroup.find('input');

            var yearly = !!$input.attr('yearly');
            if (yearly) return;

            var value = $input.val();
            var date = moment(value, 'DD-MM-YYYY', true);
            var isoDate = date.utc().format('YYYY-MM-DDTHH:mm:ssZ');

            var name = $input.attr('name');
            values[name] = isoDate;
        });

        return values;
    };
};
