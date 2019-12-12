
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DomUtils;
}

/**
 * Simple base class for dom operations
 */
function DomUtils() {
    this.listenToEvent = function(element, events, selector, action, options) {
        events = events.trim();
        events = events.indexOf(' ') !== -1 ? events.split(' ') : [events];

        for (var i = 0; i < events.length; i++) {
            if (typeof selector === 'string') {
                onEvent(element, events[i], action, options, selector);
            } else {
                action = selector;
                onEvent(element, events[i], action, options);
            }
        }
    }

    function onEvent(element, event, action, options, selector) {
        var validName = event.split('.')[0];

        element.addEventListener(validName, function(e) {
            var bindTo = getExpectedTarget(element, selector, e);
            if (!bindTo || shouldStop(event, e.detail)) return;

            return action.call(bindTo, e, action);
        }, options);
    }

    function getExpectedTarget(element, selector, e) {
        element = new DomElement(element);
        if (typeof selector === 'undefined') {
            return element;
        }

        var target = new DomElement(e.target);
        var closest = target.closest(selector);

        if (element.isParentOf(closest)) return closest;

        return null;
    }

    function shouldStop(eventName, detail) {
        var wrongType =
            typeof detail !== 'undefined' &&
            detail &&
            typeof detail.fullName !== 'undefined' &&
            eventName.indexOf(detail.fullName) !== 0;

        return wrongType;
    }
}
