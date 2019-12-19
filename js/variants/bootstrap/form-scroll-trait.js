
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = JqueryFormScrollTrait;
}

/**
 * Jquery form scrolling
 *
 * @todo  Should be removed. Instead plain JS scroll plugin should be used
 */
function JqueryFormScrollTrait() {
    this.initFormScroll = function() {
        $('.form-scrollable').perfectScrollbar();
    }

    this.updateFormScroll = function() {
        $('.form-scrollable').perfectScrollbar('update');
    }
}
