
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = scrollTo;
}

/**
 * Scroll element to position
 */
function animateScrollTop(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){
        currentTime += increment;
        var val = easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };

    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;

    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};
