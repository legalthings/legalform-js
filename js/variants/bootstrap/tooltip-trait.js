/**
 * Bootstrap tooltips
 */
function BootstrapTooltipTrait() {
    this.initTooltip = function(element, show) {
        var $element = $(element);
        var inited = $element.data('bs.tooltip');

        if (!isset(inited)) {
            $element.tooltip({
                placement: $('#doc').css('position') === 'absolute' ? 'left' : 'right',
                container: 'body'
            });
        }

        if (!inited || show) $element.tooltip('show');
    }

    this.isTooltipShown = function(help) {
        var tooltip = $(help).data('bs.tooltip');

        return isset(tooltip) && tooltip.$tip.hasClass('in');
    }

    this.hideTooltip = function(help) {
        var $help = $(help);
        var tooltip = $help.data('bs.tooltip');

        if (isset(tooltip) && tooltip.$tip.hasClass('in')) $help.tooltip('hide');
    }

    function isset(tooltip) {
        return typeof tooltip !== 'undefined' && tooltip;
    }
}
