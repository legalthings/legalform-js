
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
        var url = ractive.get(escapeDots(field.url_field));
        var options = [];

        //By default it is set to empty object
        if (value && typeof value === 'object' && typeof value[valueField] === 'undefined') value = null;
        if (value) {
            var option = value;
            if (typeof value === 'string') {
                option = {};
                option[valueField] = value;
                option[labelField] = value;
            }

            options = [option];
        }

        var choices = new Choices(element, {
            maxItemCount: 1,
            addItems: false,
            duplicateItemsAllowed: false,
            searchChoices: !useValue,
            renderSelectedChoices: 'always'
        }).enable();

        element.choices = choices;

        if (options.length) {
            var setValue = typeof value === 'string' ? value : options[0][valueField];
            var promise = doRequest(value);

            choices.setChoices(function() {
                return promise;
            });

            Promise.all([promise]).then(function() {
                choices.setChoiceByValue(setValue);
            });
        }

        input.on('search', function(e) {
            var value = e.detail.value;

            choices.setChoices(function() {
                return doRequest(value);
            });
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

        function doRequest(value) {
            if (useValue) url = ltriToUrl(url).replace('%value%', encodeURIComponent(value));
            url = clearComputedUrl(url);

            var headers = combineHeadersNamesAndValues(field.headerName || [], field.headerValue || []);
            var promise = ajaxGet(url, {headers})
                .then(function(response) {
                    response = JSON.parse(response);
                    response = ractive.applyJMESPath(response, jmespathRequest, jmespath);

                    return response;
                })
                .then(function(data) {
                    if (!Array.isArray(data)) return [];

                    return data.map(function(item) {
                        return { value: item[value_field], label: item[label_field] };
                    });
                });;

            return promise;
        }
    };

    this.triggerExternalSourceSelectLoad = function(element) {
        var choices = element.choices;
        if (!choices) return;

        element = new DomElement(element);
        element.trigger('search');

        // var selectedText = element.closest('[data-role="wrapper"]').find('.item:first-child').html();
        // if (typeof selectedText === 'undefined') selectedText = '';

        // selectize.onSearchChange(selectedText);
    }

    this.isExternalSourceSelectInitialized = function(element) {
        return !!element.choices;
    }
}
