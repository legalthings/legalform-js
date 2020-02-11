function HelperTrait(jmespath) {
    /**
     * Get locale of template or document
     * @param  {string} format
     * @return {string}
     */
    this.getLocale = function(format) {
        return typeof formatLocale !== 'undefined' ?
            formatLocale(this.locale) :
            this.locale;
    };

    /**
     * Show alert message
     * @param  {string}   status    Message status (danger, warning, success)
     * @param  {string}   message   Message to show
     * @param  {Function} callback  Action to do after message is hidden
     */
    this.alert = function(status, message, callback) {
        this.variant.alert(status, message, callback);
    };

    /**
     * Parse jmespath response
     * @param  {object} data
     * @param  {string} jmespathRequest  JMESPath transformation
     * @param  {object} jmespath
     * @return {string}
     */
    this.applyJMESPath = function(data, jmespathRequest, jmespath) {
        if (typeof jmespathRequest !== 'string' || !jmespathRequest.length) return data;

        try {
            return jmespath.search(data, jmespathRequest);
        } catch (e) {
            this.alert('error', 'JMESPath error: ' + e);
            return null;
        }
    }
}
