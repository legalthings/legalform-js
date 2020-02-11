
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaTooltipTrait;
}

/**
 * Bulma tooltips
 */
function BulmaTooltipTrait() {
    this.initTooltip = function(help, show) {
        help = new DomElement(help);
        if (help.hasClass('inited')) {
            show ? help.trigger('mouseover') : help.addClass('shown');
            return;
        }

        help.on('mouseout', function() {
            this.removeClass('shown');
        });

        var container = (new Dom()).findOne('#doc');
        var placement = container.css('position') === 'absolute' ? 'left' : 'right';

        help.addClass('inited', 'has-tooltip-' + placement);
        show ? help.trigger('mouseover') : help.addClass('shown');
    }

    this.isTooltipShown = function(help) {
        help = new DomElement(help);
        return help.hasClass('shown');
    }

    this.hideTooltip = function(help) {
        if (!this.isTooltipShown(help)) return;

        help = new DomElement(help);
        help.trigger('mouseout');
    }
}
