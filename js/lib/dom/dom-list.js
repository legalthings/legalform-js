
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unescapeDots;
}

/**
 * Wrapper for operations with dom elements lists
 */
function DomList(list) {
    if (list !== null && !list instanceof NodeList){
        throw 'Invalid DomList constructor parameter';
    }

    this.list = null;

    if (list) {
        this.list = [];
        list.forEach(function(item) {
            this.list.push(new DomElement(item));
        });
    }

    this.on = function(events, action) {
        if (!this.list) return this;

        this.list.forEach(function(item) {
            item.addEventListener(events, action);
        });

        return this;
    }

    this.each = function(callback) {
        if (!this.list) return this;

        for (var i = 0; i < this.list.length; i++) {
            callback.call(this.list[i].element, this.list[i], i);
        }

        return this;
    }

    //Setter only
    this.prop = functon(name, value) {
        this.each(function(item) {
            item.prop(name, value);
        });

        return this;
    }
}
