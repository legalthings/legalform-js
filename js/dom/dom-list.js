
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unescapeDots;
}

/**
 * Wrapper for operations with dom elements lists
 */
function DomList(list) {
    if (list !== null && !list instanceof NodeList && !Array.isArray(list)){
        throw 'Invalid DomList constructor parameter';
    }

    var self = this;
    this.list = [];

    if (list instanceof NodeList) {
        list.forEach(function(item) {
            self.list.push(new DomElement(item));
        });
    } else if (list) {
        for (var i = 0; i < list.length; i++) {
            this.list.push(new DomElement(list[i]));
        }
    } else {
        this.list = null;
    }

    this.on = function(events, action) {
        this.each(function(item) {
            item.on(events, action);
        });

        return this;
    }

    this.each = function(callback) {
        if (!this.list) return this;

        for (var i = 0; i < this.list.length; i++) {
            callback.call(this.list[i], i);
        }

        return this;
    }

    //Setter only
    this.prop = function(name, value) {
        this.each(function(item) {
            item.prop(name, value);
        });

        return this;
    }

    this.length = function() {
        return this.list ? this.list.length : 0;
    }

    this.index = function(element) {
        if (!this.list) return -1;

        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].element === element.element) return i;
        }

        return -1;
    }

    this.first = function() {
        return this.list ? list[0] : new DomElement(null);
    }
}
