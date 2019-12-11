
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Dom;
}

/**
 * Simple base class for dom operations
 */
function Dom() {
    var utils = new DomUtils();

    this.doc = typeof document !== 'undefined' ? document : null;

    Dom.prototype.findOne = function(selector) {
        var element = this.doc ?
            this.doc.querySelector(selector) :
            null;

        return new DomElement(element);
    };

    Dom.prototype.findAll = function(selector) {
        if (!this.doc) return null;

        var list = this.doc.querySelectorAll(selector);

        return new DomList(list);
    }

    Dom.prototype.on = function(events, selector, action) {
        if (this.doc) {
            utils.listenToEvent(this.doc, events, selector, action, false);
        }

        return this;
    }

    Dom.prototype.create = function(elementTag) {
        var element = this.doc ? this.doc.createElement(elementTag) : null;

        return new DomElement(element);
    }

    Dom.prototype.off = function(eventName) {
        if (this.doc) this.doc.removeEventListener(eventName);

        return this;
    }

    Dom.prototype.getFormFields = function(form) {
        var fields = form.element.elements;
        var items = [];

        for (var i = 0; i < fields.length; i++) {
            items.push(fields[i]);
        }

        return new DomList(items);
    }
}
