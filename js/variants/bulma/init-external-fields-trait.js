
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaInitExternalFieldsTrait;
}

/**
 * Bulma init for some external fields
 */
function BulmaInitExternalFieldsTrait() {
    this.initExternalSourceSelect = function(ractive, element, field, jmespath) {
        var variant = this;
        var input = new DomElement(element);
        var valueField = input.attr('value_field') || input.attr('label_field');
        var labelField = input.attr('label_field');
        var jmespathRequest = input.attr('jmespath');
        var useValue = input.attr('url').indexOf('%value%') !== -1;
        var name = field.name;
        var value = ractive.get(name);
        var options = [];

        input.attr('data-validate', 'false');

        var choices = new Choices(element, {
            maxItemCount: 1,
            addItems: false,
            duplicateItemsAllowed: false,
            searchChoices: !useValue,
            renderSelectedChoices: 'always'
        }).enable();

        input.closest('.select').addClass('with-choices');
        element.choices = choices;

        input.on('search', function(e) {
            var value = e.detail.value;
            var value2 = input.val();

            if (!useValue) return;

            choices.setChoices(function() {
                return doRequest(value);
            }, valueField, labelField, true);
        });

        input.on('choice', function(e) {
            ractive.validation.validateField(input);
            input.trigger('change');
        });

        input.on('blur', function(e) {
            if (typeof e.detail === 'undefined' || typeof e.detail.value === 'undefined') return;

            ractive.validation.validateField(input);
            input.trigger('change');
        });

        //As we do not allow adding values, this is only executed on removing value
        input.on('change', function(e) {
            if (typeof e.detail === 'undefined' || typeof e.detail.value === 'undefined') return;

            var value = e.detail.value;
            if (value === null || value === '') {
                ractive.set(name, null);
            }

            ractive.validation.validateField(input);
            input.trigger('change');
        });

        var setNull =
            (value && typeof value === 'object' && typeof value[valueField] === 'undefined') ||
            typeof value === 'undefined';

        if (setNull) {
            value = null;
        }

        var setValue = (typeof value === 'object' && value) ? value[valueField] : value;
        var promise = doRequest(setValue);

        choices.setChoices(function() {
            return promise;
        }, valueField, labelField, true);

        if (setValue) {
            Promise.all([promise]).then(function() {
                choices.setChoiceByValue(setValue);
            });
        }

        function doRequest(value) {
            var url = ractive.get(escapeDots(field.url_field));
            if (useValue) url = ltriToUrl(url).replace('%value%', encodeURIComponent(value));
            url = clearComputedUrl(url);

            var headers = combineHeadersNamesAndValues(field.headerName || [], field.headerValue || []);
            var promise = ajaxGet(url, {headers})
                .then(function(response) {
                    response = JSON.parse(response);
                    response = ractive.applyJMESPath(response, jmespathRequest, jmespath);

                    return response;
                });

            return promise;
        }
    };

    this.triggerExternalSourceSelectLoad = function(element) {
        var choices = element.choices;
        if (!choices) return;

        element = new DomElement(element);
        element.trigger('search');
    }

    this.isExternalSourceSelectInitialized = function(element) {
        return (new DomElement(element)).hasClass('choices__input');
    }
}
