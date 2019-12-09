
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DomElement;
}

/**
 * Wrapper for operatons with dom elements
 * @param {object} element
 */
function DomElement(element) {
    this.element = element instanceof DomElement ? element.element : element;

    this.findOne = function(selector, includeSelf) {
        if (typeof includeSelf !== 'undefined' && includeSelf && this.element && this.element.matches(selector)) {
            return this;
        }

        var element = this.element ? this.element.querySelector(selector) : null;

        return new DomElement(element);
    };

    this.findAll = function(selector, native) {
        var list = this.element ? this.element.querySelectorAll(selector) : null;

        return typeof native !== 'undefined' && native ? list : new DomList(list);
    }

    this.html = function(setHtml) {
        if (typeof setHtml !== 'undefined') {
            if (this.element) this.element.innerHTML = setHtml;
            return this;
        }

        return this.element ? this.element.innerHTML : '';
    }

    this.text = function() {
        return this.element ? this.element.textContent : '';
    }

    this.on = function(events, selector, action) {
        return listenToEvent(this, events, selector, action, false);
    }

    this.one = function(events, selector, action) {
        return listenToEvent(this, events, selector, action, {once: true, capture: false});
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

        if (eventName instanceof Event) {
            this.element.dispatchEvent(eventName);
            return this;
        }

        eventName = eventName.split('.')[0];
        var options = {
            bubbles: true,
            cancelable: true
        };

        var event = new Event(eventName, options);
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

    this.nextAll = function(selector) {
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

    this.prevAll = function(selector) {
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

    this.addClass = function(className) {
        if (this.element) {
            this.element.classList.add(...arguments);
        }

        return this;
    }

    this.removeClass = function(className) {
        if (this.element) {
            this.element.classList.remove(...arguments);
        }

        return this;
    }

    this.parent = function() {
        var parent = this.element ? this.element.parentElement : null;

        return new DomElement(parent);
    }

    this.remove = function() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }

        return this;
    }

    this.show = function() {
        if (!this.element) return this;

        var oldDisplay = this.attr('data-olddisplay');
        this.element.style.display = oldDisplay ? oldDisplay : '';
    }

    this.hide = function() {
        if (!this.element) return this;

        var oldDisplay = this.element.style.display;

        this.attr('data-olddisplay', oldDisplay);
        this.element.style.display = 'none';

        return this;
    }

    this.index = function() {
        if (!this.element || !this.element.parentElement) return -1;

        var parent = this.element.parentElement;
        var siblings = parent.children;

        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] === this.element) return i;
        }

        return -1;
    }

    this.children = function() {
        if (!this.element) return new DomList(null);

        var items = [];
        var kids = this.element.children;

        for (var i = 0; i < kids.length; i++) {
            items.push(kids[i]);
        }

        return new DomList(items);
    }

    this.outerHeight = function() {
        return this.element ? this.element.offsetHeight : 0;
    }

    this.position = function() {
        if (!this.element) return {top: 0, left: 0};

        return {
            top: this.element.offsetTop,
            left: this.element.offsetLeft
        }
    }

    this.scrollTop = function(pos) {
        if (this.element) {
            this.element.scrollTop = pos;
        }

        return this;
    }

    function listenToEvent(wrapper, events, selector, action, options) {
        if (!wrapper.element) return wrapper;

        events = events.trim();
        events = events.indexOf(' ') !== -1 ? events.split(' ') : [events];

        if (typeof action === 'undefined') {
            action = selector;
            onSimpleEvent(wrapper.element, events, action, options);
        } else {
            onDelegatedEvent(wrapper.element, events, selector, action, options);
        }

        return wrapper;
    }

    function onSimpleEvent(element, events, action, options) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i].split('.')[0];

            console.log('Add listener: ', event, element);

            // element.addEventListener(event, action, false);
            element.addEventListener(event, function(e) {
                console.log('-- Fired!', e.type, this);

                var target = new DomElement(e.target);
                return action.call(target, e, action);
            }, options);
        }
    }

    function onDelegatedEvent(element, events, selector, action, options) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i].split('.')[0];
            console.log('Add d-listener: ', event, element, selector);

            element.addEventListener(event, function(e) {
                // console.log('-- Event:', e.type, this, e.target);
                // console.log('-- For selector: ', selector);
                if (!e.target.matches(selector)) return;
                // console.log('-- call action');

                var target = new DomElement(e.target);
                return action.call(target, e, action);
            }, options);
        }
    }
}
