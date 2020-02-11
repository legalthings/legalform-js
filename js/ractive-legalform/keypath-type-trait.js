/**
 * Methods to check the type of keypath
 */
function KeypathTypeTrait() {
    /**
     * Suffixes in keypath names that determine their special behaviour
     * @type {Object}
     */
    this.suffix = {
        conditions: '-conditions',
        expression: '-expression',
        defaults: '-default',
        repeater: '-repeater',
        external_url: '-url',
        validation: '-validation',
        amount: '.amount'
    };

    /**
     * Determine if keypath belongs to computed property
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isComputed = function(keypath) {
        return this.isCondition(keypath) ||
            this.isDefault(keypath) ||
            this.isExpression(keypath) ||
            this.isExternalUrl(keypath) ||
            this.isValidation(keypath) ||
            this.isRepeater(keypath);
    };

    /**
     * Determine if keypath belongs to condition variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isCondition = function(keypath) {
        return endsWith(keypath, this.suffix.conditions);
    };

    /**
     * Determine if keypath belongs to expression variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isExpression = function(keypath) {
        return endsWith(keypath, this.suffix.expression);
    };

    /**
     * Determine if keypath belongs to default variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isDefault = function(keypath) {
        return endsWith(keypath, this.suffix.defaults);
    };

    /**
     * Determine if keypath belongs to repeater variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isRepeater = function(keypath) {
        return endsWith(keypath, this.suffix.repeater);
    };

    /**
     * Determine if keypath belongs to computed external url variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isExternalUrl = function(keypath) {
        return endsWith(keypath, this.suffix.external_url);
    };

    /**
     * Determine if keypath belongs to validation variable
     * @param  {string}  keypath
     * @return {Boolean}
     */
    this.isValidation = function(keypath) {
        return endsWith(keypath, this.suffix.validation);
    };
};
