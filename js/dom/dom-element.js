
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

    }

    this.removeClass = function(className) {

    }

    this.parent = function() {

    }

    this.remove = function() {

    }

    this.show = function() {

    }

    this.index = function() {

    }

    this.children = function() {

    }

    this.outerHeight = function() {

    }

    this.position = function() {

    }

    this.scrollTop = function(pos) {

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
