function InitPreviewSwitchTrait() {
    /**
     * Preview switch for mobile
     */
    this.initPreviewSwitch = function () {
        var dom = new Dom();
        var buttons = '#nav-show-info, #nav-show-preview, #nav-show-form';

        dom.on('click', buttons, function() {
            dom.findAll(buttons).each(function() {
                this.removeClass('active');
            })

            this.addClass('active');
        });

        dom.on('click', '#nav-show-info', function() {
            don.findOne('#doc').removeClass('show-preview');
        });

        dom.on('click', '#nav-show-preview', function() {
            dom.findOne('#doc').addClass('show-preview');
        });
    };
}
