
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DomElement;
}

/**
 * Wrapper for operatons with dom elements
 * @param {object} element
 */
function DomElement(element) {
    var utils = new DomUtils();

    this.element = element instanceof DomElement ? element.element : element;

    DomElement.prototype.findOne = function(selector, includeSelf) {
        if (typeof includeSelf !== 'undefined' && includeSelf && this.element && this.element.matches(selector)) {
            return this;
        }

        var element = this.element ? this.element.querySelector(selector) : null;

        return new DomElement(element);
    };

    DomElement.prototype.findAll = function(selector, native) {
        var list = this.element ? this.element.querySelectorAll(selector) : null;

        return typeof native !== 'undefined' && native ? list : new DomList(list);
    }

    DomElement.prototype.html = function(setHtml) {
        if (typeof setHtml !== 'undefined') {
            if (this.element) this.element.innerHTML = setHtml;
            return this;
        }

        return this.element ? this.element.innerHTML : '';
    }

    DomElement.prototype.text = function(text) {
        if (typeof text === 'undefined') {
            return this.element ? this.element.textContent : '';
        }

        if (this.element) this.element.textContent = text;
        return this;
    }

    DomElement.prototype.on = function(events, selector, action) {
        if (this.element) {
            utils.listenToEvent(this.element, events, selector, action, false);
        }

        return this;
    }

    DomElement.prototype.one = function(events, selector, action) {
        if (this.element) {
            utils.listenToEvent(this.element, events, selector, action, {once: true, capture: false});
        }

        return this;
    }

    DomElement.prototype.off = function(eventName) {
        if (this.element) this.element.removeEventListener(eventName);

        return this;
    }

    DomElement.prototype.attr = function(name, value) {
        if (typeof value === 'undefined') {
            return this.element ? this.element.getAttribute(name) : '';
        }

        if (this.element) this.element.setAttribute(name, value);

        return this;
    }

    DomElement.prototype.removeAttr = function(name) {
        if (this.element) {
            this.element.removeAttribute(name);
        }

        return this;
    }

    DomElement.prototype.prop = function(name, value) {
        if (typeof value === 'undefined') {
            return this.element ? this.element[name] : null;
        }

        if (this.element) this.element[name] = value;

        return this;
    }

    DomElement.prototype.closest = function(selector) {
        var closest = this.element ? this.element.closest(selector) : null;

        return new DomElement(closest);
    }

    DomElement.prototype.isParentOf = function(element) {
        if (!this.element || !element.element) return false;
        if (this.element === document) return true;

        var parent = element.element;

        while (parent = parent.parentElement) {
            if (parent === this.element) return true;
        }

        return false;
    }

    DomElement.prototype.trigger = function(eventName, options) {
        if (!this.element) return null;

        if (eventName instanceof Event) {
            this.element.dispatchEvent(eventName);
            return eventName;
        }

        var validName = eventName.split('.')[0];
        var defaultOptions = {
            bubbles: true,
            cancelable: true
        };

        if (typeof options === 'undefined') options = {};
        options = cloner.shallow.merge({}, defaultOptions, options);

        if (typeof options.detail === 'undefined') {
            options.detail = {};
        }
        options.detail.fullName = eventName;

        var event = new CustomEvent(validName, options);
        this.element.dispatchEvent(event);

        return event;
    }

    DomElement.prototype.isValid = function() {
        return this.element ? this.element.validity.valid : true;
    }

    DomElement.prototype.setCustomValidity = function(error) {
        if (this.element) {
            this.element.setCustomValidity(error);
        }

        return this;
    }

    DomElement.prototype.is = function(selector) {
        if (!this.element) return false;
        if (typeof selector === 'string') return this.element.matches(selector);
        return this.element === selector.element;
    }

    DomElement.prototype.nextAll = function(selector) {
        if (!this.element) return new DomList(null);

        var result = [];
        var next = this.element;

        while (next = next.nextSibling) {
            if (next.nodeType === 1 && next.matches(selector)) {
                result.push(next);
            }
        }

        return new DomList(result);
    }

    DomElement.prototype.prevAll = function(selector) {
        if (!this.element) return new DomList(null);

        var result = [];
        var prev = this.element;

        while (prev = prev.previousSibling) {
            if (prev.nodeType === 1 && prev.matches(selector)) {
                result.push(prev);
            }
        }

        return new DomList(result);
    }

    DomElement.prototype.hasClass = function(className) {
        return this.element ? this.element.classList.contains(className) : false;
    }

    DomElement.prototype.addClass = function(className) {
        if (this.element) {
            this.element.classList.add(...arguments);
        }

        return this;
    }

    DomElement.prototype.removeClass = function(className) {
        if (this.element) {
            this.element.classList.remove(...arguments);
        }

        return this;
    }

    DomElement.prototype.toggleClass = function(className, state) {
        if (typeof state !== 'undefined') {
            state ? this.addClass(className) : this.removeClass(className);
        } else {
            this.hasClass(className) ?
                this.removeClass(className) :
                this.addClass(className);
        }

        return this;
    }

    DomElement.prototype.parent = function() {
        var parent = this.element ? this.element.parentElement : null;

        return new DomElement(parent);
    }

    DomElement.prototype.remove = function() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }

        return this;
    }

    DomElement.prototype.show = function() {
        if (!this.element) return this;

        var oldDisplay = this.attr('data-olddisplay');
        if (typeof oldDisplay !== 'undefined' && oldDisplay) {
            this.element.style.display = oldDisplay;
        }

        if (!this.isVisible()) {
            this.element.style.display = 'block';
        }
    }

    DomElement.prototype.hide = function() {
        if (!this.element) return this;

        var oldDisplay = this.element.style.display;

        this.attr('data-olddisplay', oldDisplay);
        this.element.style.display = 'none';

        return this;
    }

    //Getter only
    DomElement.prototype.css = function(name) {
        if (!this.element) return '';

        var styles = getComputedStyle(this.element);
        name = toCamelCase(name);

        return typeof styles[name] !== 'undefined' ? styles[name] : '';
    }

    DomElement.prototype.index = function() {
        if (!this.element || !this.element.parentElement) return -1;

        var parent = this.element.parentElement;
        var siblings = parent.children;

        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] === this.element) return i;
        }

        return -1;
    }

    DomElement.prototype.children = function() {
        if (!this.element) return new DomList(null);

        var items = [];
        var kids = this.element.children;

        for (var i = 0; i < kids.length; i++) {
            items.push(kids[i]);
        }

        return new DomList(items);
    }

    DomElement.prototype.outerHeight = function() {
        return this.element ? this.element.offsetHeight : 0;
    }

    DomElement.prototype.position = function() {
        if (!this.element) return {top: 0, left: 0};

        return {
            top: this.element.offsetTop,
            left: this.element.offsetLeft
        }
    }

    DomElement.prototype.offset = function() {
        if (!this.element) return {top: 0, left: 0};

        var rect = this.element.getBoundingClientRect();

        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

    DomElement.prototype.scrollTop = function(pos, duration) {
        if (this.element) {
            duration ?
                animateScrollTop(this.element, pos, duration) :
                this.element.scrollTop = pos;
        }

        return this;
    }

    DomElement.prototype.parentsUntil = function(tillSelector, filterSelector) {
        if (!this.element) return new DomList(null);

        var items = [];
        var parent = this.element;

        while (parent = parent.parentElement) {
            var matches =
                (typeof tillSelector === 'undefined' || !parent.matches(tillSelector)) &&
                (typeof filterSelector === 'undefined' || parent.matches(filterSelector));

            if (matches) items.push(parent);
        }

        return new DomList(items);
    }

    DomElement.prototype.width = function(width) {
        if (typeof width === 'undefined') {
            return this.element ? this.element.offsetWidth : 0;
        }

        if (this.element) {
            this.element.style.width = width;
        }

        return this;
    }

    DomElement.prototype.height = function(height) {
        if (typeof height === 'undefined') {
            return this.element ? this.element.offsetHeight : 0;
        }

        if (this.element) {
            this.element.style.height = height;
        }

        return this;
    }

    DomElement.prototype.isVisible = function() {
        if (!this.element) return false;

        return !!(
            this.element.offsetWidth ||
            this.element.offsetHeight ||
            this.element.getClientRects().length
        );
    }

    DomElement.prototype.val = function(value) {
        if (typeof value !== 'undefined') {
            if (this.element) this.element.value = value;

            return this;
        }

        return this.element ? this.element.value : '';
    }

    DomElement.prototype.focus = function(value) {
        if (this.element) {
            this.element.focus();
        }

        return this;
    }

    DomElement.prototype.append = function(element) {
        if (!this.element || !element.element) return this;

        this.element.appendChild(element.element);

        return this;
    }
}
