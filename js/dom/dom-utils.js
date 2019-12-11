
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

        if (typeof action === 'undefined') {
            action = selector;
            onSimpleEvent(element, events, action, options);
        } else {
            onDelegatedEvent(element, events, selector, action, options);
        }
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
