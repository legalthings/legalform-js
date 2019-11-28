function InitPreviewSwitchTrait($, jmespath) {
    /**
     * Preview switch for mobile
     */
    this.initPreviewSwitch = function () {

        $('#nav-show-info, #nav-show-preview, #nav-show-form').on('click', function() {
            $('#nav-show-info, #nav-show-preview, #nav-show-form').removeClass('active');
            $(this).addClass('active');
        });

        $('#nav-show-info').on('click', function() {
            $('#doc').removeClass('show-preview');
        });

        $('#nav-show-preview').on('click', function() {
            $('#doc').addClass('show-preview');
        });
    };
}
