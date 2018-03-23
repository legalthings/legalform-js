// Use default date for moment
moment.fn.toString = function() {
    if (typeof this.defaultFormat === 'undefined') return this.toDate().toString();
    return this.format(this.defaultFormat);
};
