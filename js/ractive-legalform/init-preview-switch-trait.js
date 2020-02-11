function InitPreviewSwitchTrait() {
    /**
     * Preview switch for mobile
     */
    this.initPreviewSwitch = function () {
        var dom = this.dom;
        var selector = '#nav-show-info, #nav-show-preview, #nav-show-form';
        var buttons = dom.findAll(selector);

        buttons.on('click', function() {
            buttons.each(function() {
                this.removeClass('active');
            })

            (new DomElement(this)).addClass('active');
        });

        dom.findOne('#nav-show-info').on('click', function() {
            don.findOne('#doc').removeClass('show-preview');
        });

        dom.findOne('#nav-show-preview').on('click', function() {
            dom.findOne('#doc').addClass('show-preview');
        });
    };
}
