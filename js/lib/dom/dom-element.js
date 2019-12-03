
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DomElement;
}

/**
 * Wrapper for operatons with dom elements
 * @param {object} element
 */
function DomElement(element) {
    this.element = element instanceof DomElement ? element.element : element;

    this.findOne = function(selector) {
        var element = this.element ? this.element.querySelector(selector) : null;

        return new DomElement(element);
    };

    this.findAll = function(selector) {
        var list = this.element ? this.element.querySelectorAll(selector) : null;

        return new DomList(list);
    }

    this.html = function(setHtml) {
        if (typeof setHtml !== 'undefined') {
            if (this.element) this.element.innerHTML = setHtml;
            return this;
        }

        return this.element ? this.element.innerHTML : '';
    }

    this.on = function(events, action) {
        if (arguments.length === 2) {
            if (this.element) {
                this.element.addEventListener(events, action);
            }
        } else if (arguments.length === 3) {
            var selector = action;
            action = arguments[2];

            this.findAll(selector).on(events, action);
        }

        return this;
    }

    this.attr = function(name, value) {
        if (typeof value === 'undefined') {
            return this.element ? this.element.getAttribute(name) : null;
        }

        if (this.element) this.element.setAttribute(name, value);

        return this;
    }

    this.prop = function(name, value) {
        if (typeof value === 'undefined') {
            return this.element ? this.element[name] : null;
        }

        if (this.element) this.element[name] = value;

        return this;
    }

    this.closest = function(selector) {
        var closest = this.element ? this.element.closest(selector) : null;

        return new DomElement(closest);
    }

    this.trigger = function(eventName) {
        if (!this.element) return this;

        var event = new Event(eventName);
        this.element.dispatchEvent(event);

        return this;
    }

    this.isValid = function() {
        return this.element ? this.element.validity.valid : true;
    }

    this.hasClass = function(className) {
        return this.element ? this.element.classList.contains(className) : false;
    }

    this.setCustomValidity = function(error) {
        if (this.element) {
            this.element.setCustomValidity(error);
        }

        return this;
    }

    this.is = function(selector) {
        return this.element ? this.element.matches(selector) : false;
    }

    // this.data = function(key, value) {
    //     key = 'data-' + key;
    //     if (typeof value === 'undefined') {
    //         return this.element ? this.element.getAttribute(key) : null;
    //     }


    // }
}
