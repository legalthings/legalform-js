
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Dom;
}

/**
 * Simple base class for dom operations
 */
function Dom() {
    this.doc = typeof document !== 'undefined' ? document : null;

    this.findOne = function(selector) {
        var element = this.doc ?
            this.doc.querySelector(selector) :
            null;

        return new DomElement(element);
    };

    this.findAll = function(selector) {
        if (!this.doc) return null;

        var list = this.doc.querySelectorAll(selector);

        return new DomList(list);
    }

    this.on = function(events, selector, action) {
        if (!this.doc) return this;

        var list = this.doc.querySelectorAll(selector);

        list.forEach(function(item) {
            item.addEventListener(events, action);
        });

        return this;
    }

    this.create = function(elementTag) {
        var element = this.doc ? this.doc.createElement(elementTag) : null;

        return new DomElement(element);
    }

    this.off = function(eventName) {
        if (this.doc) this.doc.removeEventListener(eventName);

        return this;
    }
}
