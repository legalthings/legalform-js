
function FormScrollTrait() {
    this.initFormScroll = function() {
        var form = (new Dom()).findOne('.form-scrollable');
        if (!form.element) return;

        var scrollbar = new PerfectScrollbar(form.element);

        form.element.perfectScrollbar = scrollbar;
    }

    this.updateFormScroll = function() {
        var form = (new Dom()).findOne('.form-scrollable');
        if (!form.element) return;

        var scrollbar = form.element.perfectScrollbar;
        if (scrollbar instanceof PerfectScrollbar) {
            scrollbar.update();
        }
    }
}
