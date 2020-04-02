
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

    init.call(this, list);

    DomList.prototype.on = function(events, action) {
        this.each(function(item) {
            this.on(events, action);
        });

        return this;
    }

    DomList.prototype.each = function(callback) {
        if (!this.list) return this;

        for (var i = 0; i < this.list.length; i++) {
            callback.call(this.list[i], i);
        }

        return this;
    }

    //Setter only
    DomList.prototype.prop = function(name, value) {
        this.each(function(item) {
            this.prop(name, value);
        });

        return this;
    }

    DomList.prototype.length = function() {
        return this.list ? this.list.length : 0;
    }

    DomList.prototype.index = function(element) {
        if (!this.list || !element.element) return -1;

        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].element == element.element) return i;
        }

        return -1;
    }

    DomList.prototype.get = function(idx) {
        var exist = this.list && this.list[idx] instanceof DomElement;

        return exist ? this.list[idx] : new DomElement(null);
    }

    DomList.prototype.first = function() {
        return this.list && this.list.length ? this.list[0] : new DomElement(null);
    }

    DomList.prototype.last = function() {
        return this.list && this.list.length ? this.list[ this.list.length - 1 ] : new DomElement(null);
    }

    DomList.prototype.not = function(selector) {
        if (!this.list) return new DomList(null);

        var items = [];
        for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];

            if (!item.element || item.element.matches(selector)) continue;
            items.push(item);
        }

        return new DomList(items);
    }

    DomList.prototype.map = function(action) {
        if (!this.list) return [];

        var result = [];
        for (var i = 0; i < this.list.length; i++) {
            var item = action.call(this.list[i]);
            result.push(item);
        }

        return result;
    }

    DomList.prototype.filter = function(selector) {
        if (!this.list) return new DomList(null);

        var matched = [];
        for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (!item.element) continue;

            var hasMatch =
                (typeof selector === 'string' && item.element.matches(selector)) ||
                (typeof selector === 'function' && selector.call(item));

            if (hasMatch){
                matched.push(item);
            }
        }

        return new DomList(matched);
    }

    DomList.prototype.add = function(list) {
        if (!list.list) return this;
        if (!this.list) {
            this.list = list.list;
            return this;
        }

        for (var i = 0; i < list.list.length; i++) {
            this.list.push(list.list[i]);
        }

        return this;
    }

    function init(list) {
        if (list instanceof NodeList) {
            list.forEach(function(item) {
                self.list.push(new DomElement(item));
            });
        } else if (list) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (!(item instanceof DomElement)) {
                    item = new DomElement(item);
                }

                this.list.push(item);
            }
        } else {
            this.list = null;
        }
    }
}
