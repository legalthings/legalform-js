
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FormWizard;
}

/**
 * Unescape dots in computed keypath name
 * @param {string} keypath
 * @return {string}
 */
function FormWizard(element, options) {
    var self = this;
    if (typeof options === 'undefined') {
        options = {};
    }

    this.dom = new Dom();
    this.element = element;
    this.defaults = {
        donestep: false
    };

    this.options = cloner.shallow.merge({}, this.defaults, options);

    init();

    FormWizard.prototype.listen = function () {
        this.element.on('click.wizard', '[data-toggle="wizard"]', this.click.bind(this));
    }

    FormWizard.prototype.show = function(step) {
        var target = this.getTarget(step);

        if (!target.element || target.hasClass('active')) {
            if (step === 'done') this.element.trigger('done.wizard');
            return;
        }

        var active = this.element.findOne('.wizard-step.active');
        var direction = target.nextAll('.active').length() ? 'right' : 'left';
        var to = direction === 'left' ? 'next' : 'prev';

        var eventOptions = {
            relatedTarget: target.element,
            bubbles: true,
            cancelable: true,
            detail: {
                direction: to === 'next' ? 'forward' : 'back'
            }
        };

        var e = this.element.trigger('step.wizard', eventOptions);

        if (e.defaultPrevented) return;
        if (this.sliding) return this.element.one('step.wizard', function () { self.show(step) });

        this.sliding = true;

        // Here we skip transitions for now

        active.removeClass('active');
        target.addClass('active');
        this.activate(target);
        this.sliding = false;
        this.element.trigger('stepped.wizard');
    }

    FormWizard.prototype.refresh = function() {
        var target = this.element.findOne('.wizard-step.active');
        if (!target.element) target = this.element.findAll('.wizard-step').first();

        target.addClass('active');
        this.activate(target);
    }

    FormWizard.prototype.getTarget = function(step) {
        var target;
        var active = this.element.findOne('.wizard-step.active');

        if (step === 'first') {
            target = this.element.children('.wizard-step').first();
        } else if (step === 'prev') {
            target = active.prevAll('.wizard-step').first();
        } else if (step === 'next') {
            target = active.nextAll('.wizard-step').first();
        } else if (step === 'done' && this.options.donestep) {
            target = this.element.findAll('.wizard-step').last();
        } else if (typeof step === 'number' || step.match(/^-?\d+$/)) {
            target = this.element.children('.wizard-step').get(step - (step >= 0));
        } else {
            target = step;
        }

        return target;
    }

    FormWizard.prototype.activate = function(target) {
        this.clearActivate()
        this.setActivate(target)
        this.setProgress(target)
    }

    FormWizard.prototype.clearActivate = function() {
        var id = this.element.attr('id');
        var ids = this.element.children('.wizard-step[id]').map(function() {
            return this.attr('id');
        });

        ids.push(id);

        for (var i = 0; i < ids.length; i++) {
            var links = this.dom.findAll('[data-target="#' + ids[i] + '"], a[href="#' + ids[i] + '"]');

            links.each(function() {
                this.closest('.wizard-hide').removeClass('in');

                self.getActivateElement(this).not('.progress').each(function() {
                    this.removeClass('active');
                });
            });
        }
    }

    FormWizard.prototype.setActivate = function(target) {
        var steps = this.element.children('.wizard-step');
        var target = steps.filter('.active').first();
        var index = steps.index(target);
        var length = steps.length() - (this.options.donestep ? 1 : 0);

        if (index === -1) return; // shouldn't happen

        var id = this.element.attr('id');
        this.dom.findAll('[data-target="#' + id + '"], a[href="#' + id + '"]').filter(function() {
            var step = this.attr('data-step');

            if (!step) return false;
            if (target.is(step)) return true;
            if (typeof step === 'number' || step.match(/^\d+$/)) {
                step = parseInt(step, 10);
                return step === index + 1 || step === index - $steps.length;
            }

            if (step === 'first' || step === 'prev') return index > 0;
            if (step === 'next') return index + 1 < length;
            if (step === 'done') return index + 1 === length;
        }).each(function() {
            this.closest('.wizard-hide').addClass('in');

            self.getActivateElement(this).each(function() {
                this.addClass('active');
            });
        });

        var targetId = target.attr('id');

        this.dom.findAll('[data-target="#' + targetId + '"], a[href="#' + targetId + '"]').each(function() {
            this.closest('.wizard-hide').addClass('in');

            self.getActivateElement(this).each(function() {
                this.addClass('active');
            });
        });
    }

    FormWizard.prototype.getActivateElement = function(link) {
        if (!link.closest('.wizard-follow').element) return new DomList(null);

        if (link.closest('li').element) {
            return link.parentsUntil('.wizard-follow', 'li');
        }

        return new DomList([link]);
    }

    FormWizard.prototype.setProgress = function(target) {
        var steps = this.element.children('.wizard-step');
        var progress = this.dom.findOne('.progress.wizard-follow[data-target="#' + this.element.attr('id') + '"]');
        var index = steps.index(target);
        var length = steps.length() - (this.options.donestep ? 1 : 0);

        progress.findOne('.step').text(index + 1);
        progress.findOne('.steps').text(length);

        progress[index < length ? 'show' : 'hide']();
        progress.findOne('.progress-bar').width(((index + 1) * 100 / length) + '%');
    }

    function init() {
        self.dom.on('click.wizard.data-api', '[data-toggle=wizard]', function(e) {
            e.preventDefault();

            var target  = this.attr('data-target');
            var element = self.dom.findOne(target).closest('.wizard');
            var step = this.attr('data-step');

            self.show(step);
        });
    }
}
