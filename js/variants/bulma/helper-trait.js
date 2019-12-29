
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = BulmaHelperTrait;
}

/**
 * Some helper methods
 */
function BulmaHelperTrait() {
    this.alert = function(status, message, callback) {
        if (status === 'error') status = 'danger';

        var dom = new Dom();
        var container = dom.create('div');
        container.addClass('notification', 'notification-fixed-top', 'is-' + status);
        container.html('<button class="delete"></button>' + message);
        container.on('click', '.delete', function() {
            this.closest('.notification').remove();
        });

        dom.findAll('.notification-fixed-top').each(function() {
            this.remove();
        });

        dom.findOne('body').append(container);

        setTimeout(function() {
            container.remove();
        }, 3000);
    }
}
