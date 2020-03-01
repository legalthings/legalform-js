function InitExernalFieldsTrait() {
    /**
     * Init external source field
     * @param  {object} field
     */
    this.initExternalSource = function(field) {
        var ractive = this;
        var urlField = escapeDots(field.url_field);
        var conditionsField = escapeDots(field.conditions_field);

        var target = urlField;
        if (conditionsField) target += ' ' + conditionsField;

        //Watch for changes in url and conditions
        ractive.observe(target, function() {
            handleObserve(field);
        }, {defer: true, init : false});

        handleObserve(field);

        //Handle observed changes
        function handleObserve(field) {
            if (field.conditions && !ractive.get(conditionsField)) return;

            var input = ractive.elWizard.findOne('[name="' + field.name + '"]');
            var isInited = ractive.variant.isExternalSourceSelectInitialized(input.element);

            if (!isInited) return ractive.initExternalSourceSelect(input.element, field); //Handle condition change

            //Handle url change. Auto launch search with current shown field text
            ractive.variant.triggerExternalSourceSelectLoad(input.element);
        }
    };

    /**
     * Turn element into selectize control for external source select
     *
     * @param {Element} element
     */
    this.initExternalSourceSelect = function(element, field) {
        this.variant.initExternalSourceSelect(this, element, field, this.jmespath);
    };

    /**
     * Init external data fields in 'use' mode
     *
     * @param {object} field
     */
    this.initExternalData = function(field) {
        var ractive = this;

        //Watch for changes in url and field conditions
        if (field.type !== 'external_data') return;

        var urlField = escapeDots(field.url_field);
        var conditionsField = escapeDots(field.conditions_field);

        var target = urlField;
        if (conditionsField) target += ' ' + conditionsField;

        ractive.observe(target, function() {
            handleObserve(field);
        }, {defer: true, init : false});

        handleObserve(field);

        //Handle observed changes
        function handleObserve(field) {
            var url = ractive.get(urlField);
            url = clearComputedUrl(url);

            field.conditions && !ractive.get(conditionsField) ?
                ractive.set(field.name, null) :
                loadExternalUrl(url, field);
        }

        //Load data from external url
        function loadExternalUrl(url, field) {
            var options = {
                headers: combineHeadersNamesAndValues(field.headerName || [], field.headerValue || [])
            };

            ajaxRequest(url, options)
                .then(function(response) {
                    response = JSON.parse(response);
                    response = ractive.applyJMESPath(response, field.jmespath, ractive.jmespath);

                    ractive.set(field.name, response);
                })
                .catch(function(error) {
                    ractive.alert('error', 'Failed to load external data from ' + url);
                });
        }
    };
}
