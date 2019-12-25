/*!
 * Validator v0.11.9 for Bootstrap 3, by @1000hz
 * Copyright 2017 Cina Saffary
 * Licensed under http://opensource.org/licenses/MIT
 *
 * https://github.com/1000hz/bootstrap-validator
 */

function FormValidator(form, options) {
  var dom = new Dom();

  form.element.formValidator = this;

  if (typeof options === 'undefined') {
    options = {};
  }
  if (typeof options.custom === 'undefined') {
    options.custom = {};
  }

  FormValidator.prototype.init = function() {
    this.options = cloner.deep.merge({}, FormValidator.DEFAULTS, options);
    this.validators = cloner.shallow.merge({}, FormValidator.VALIDATORS, options.custom);
    this.form = form;
    this.buttons = dom.findAll('button[type="submit"], input[type="submit"]')
        .filter('[form="' + this.form.attr('id') + '"]')
        .add(this.form.findAll('input[type="submit"], button[type="submit"]'));

    this.update();

    this.form.on('input.bs.validator change.bs.validator focusout.bs.validator', this.onInput.bind(this));
    this.form.on('submit.bs.validator', this.onSubmit.bind(this));
    this.form.on('reset.bs.validator', this.reset.bind(this));

    this.form.findAll('[data-match]').each(function() {
      var input  = this;
      var target = input.attr('data-match');

      dom.findOne(target).on('input.bs.validator', function(e) {
        getValue(input) && input.trigger('input.bs.validator');
      });
    });

    // run validators for fields with values, but don't clobber server-side errors
    this.inputs.filter(function () {
      return getValue(this) && !this.closest('.has-error').element;
    }).each(function() {
      this.trigger('focusout');
    });

    this.form.attr('novalidate', true) // disable automatic native validation
  }

  FormValidator.FOCUS_OFFSET = 20;

  FormValidator.DEFAULTS = {
    delay: 500,
    html: false,
    disable: true,
    focus: true,
    custom: {},
    errors: {
      match: 'Does not match',
      minlength: 'Not long enough'
    },
    feedback: {
      success: 'glyphicon-ok',
      error: 'glyphicon-remove'
    }
  };

  FormValidator.VALIDATORS = {
    'native': function (el) {
      var el = el.element;
      if (el.checkValidity) {
        return !el.checkValidity() && !el.validity.valid && (el.validationMessage || "error!");
      }
    },
    'match': function (el) {
      var target = el.attr('data-match');
      if (!target) return false;

      return el.val() !== dom.findOne(target).val() && FormValidator.DEFAULTS.errors.match;
    },
    'minlength': function (el) {
      var minlength = el.attr('data-minlength');
      return el.val().length < minlength && FormValidator.DEFAULTS.errors.minlength
    }
  };

  FormValidator.prototype.update = function () {
    var self = this;

    this.form
        .findAll('[data-validate="false"]')
        .each(function () {self.clearErrors(this);});

    this.inputs = this.form.findAll('select, textarea, input, [data-validate="true"]')
      .filter(function() {
        var skip = this.is('[type="hidden"], [type="submit"], [type="reset"], button') || !this.isVisible();

        return !skip;
      });

    this.toggleSubmit();

    return this
  }

  FormValidator.prototype.onInput = function (e) {
    var self = this;
    var el = new DomElement(e.target);
    var deferErrors = e.type !== 'focusout';
    var hasEl = false;

    this.inputs.each(function() {
        if (this.is(el)) hasEl = true;
    })

    if (!hasEl) return;

    this.validateInput(el, deferErrors).then(function () {
      self.toggleSubmit();
    })
  }

  FormValidator.prototype.validateInput = function(el, deferErrors) {
    var value = getValue(el);
    var prevErrors = el.element.validatorErrors;

    if (el.is('[type="radio"]')) {
        el = this.form.findOne('input[name="' + el.attr('name') + '"]');
    }

    var e = this.form.trigger('validate.bs.validator', {relatedTarget: el.element});
    if (e.defaultPrevented) return;

    var self = this;

    return this.runValidators(el).then(function(errors) {
      el.element.validatorErrors = errors;

      errors.length
        ? deferErrors ? self.defer(el, self.showErrors) : self.showErrors(el)
        : self.clearErrors(el)

      if (!prevErrors || errors.toString() !== prevErrors.toString()) {
        e = errors.length
          ? self.form.trigger('invalid.bs.validator', {relatedTarget: el.element, detail: errors})
          : self.form.trigger('valid.bs.validator', {relatedTarget: el.element, detail: prevErrors});
      }

      self.toggleSubmit();
      self.form.trigger('validated.bs.validator', {relatedTarget: el.element});
    })
  }

  FormValidator.prototype.runValidators = function(el) {
    var self = this;
    var errors = [];

    function getValidatorSpecificError(key) {
      return el.attr('data-' + key + '-error');
    }

    function getValidityStateError() {
      var validity = el.element.validity;
      return validity.typeMismatch    ? el.attr('data-type-error')
           : validity.patternMismatch ? el.attr('data-pattern-error')
           : validity.stepMismatch    ? el.attr('data-step-error')
           : validity.rangeOverflow   ? el.attr('data-max-error')
           : validity.rangeUnderflow  ? el.attr('data-min-error')
           : validity.valueMissing    ? el.attr('data-required-error')
           :                            null
    }

    function getGenericError() {
      return el.attr('data-error')
    }

    function getErrorMessage(key) {
      return getValidatorSpecificError(key)
          || getValidityStateError()
          || getGenericError()
    }

    function launchValidator(key, validator) {
      var error = null;
      var hasError = (getValue(el) || el.element.required) &&
          (el.attr('data-' + key) !== undefined || key == 'native') &&
          (error = validator.call(self, el));

      if (hasError) {
         error = getErrorMessage(key) || error;
        !~errors.indexOf(error) && errors.push(error);
      }
    }

    for (var name in this.validators) {
        launchValidator(name, this.validators[name]);
    }

    //Removed remote validation here

    var deferred = Promise.resolve(errors);

    return deferred;
  }

  FormValidator.prototype.validate = function () {
    var self = this;
    var promises = [];

    this.inputs.each(function() {
        var promise = self.validateInput(this, false);
        promises.push(promise);
    });

    Promise.all(promises).then(function () {
      self.toggleSubmit();
      self.focusError();
    });

    return this;
  }

  FormValidator.prototype.focusError = function () {
    if (!this.options.focus) return;

    var input = this.form.findOne('.has-error').findOne('input, select, textarea');
    if (!input.element) return;

    var pos = input.offset().top - FormValidator.FOCUS_OFFSET;
    dom.findOne('html, body').scrollTop(pos, 250);

    input.focus();
  }

  FormValidator.prototype.showErrors = function (el) {
    var method = this.options.html ? 'html' : 'text';
    var errors = el.element.validatorErrors;
    if (!errors.length) return;

    var group = el.closest('[data-role="wrapper"]');
    var block = group.findOne('.help-block.with-errors');
    var feedback = group.findOne('.form-control-feedback');

    errorsElement = dom.create('ul').addClass('list-unstyled');

    for (var i = 0; i < errors.length; i++) {
        var item = dom.create('li');
        item[method](errors[i]);
        errorsElement.append(item);
    }

    block.element && (block.element.validatorOriginalContent === undefined) && (block.element.validatorOriginalContent = block.html());
    block.html('').append(errorsElement);
    group.addClass('has-error', 'has-danger');

    group.hasClass('has-feedback')
      && feedback.removeClass(this.options.feedback.success)
      && feedback.addClass(this.options.feedback.error)
      && group.removeClass('has-success');
  }

  FormValidator.prototype.clearErrors = function (el) {
    var group = el.closest('[data-role="wrapper"]');
    var block = group.findOne('.help-block.with-errors');
    var feedback = group.findOne('.form-control-feedback');

    block.html(block.element && block.element.validatorOriginalContent);
    group.removeClass('has-error', 'has-danger', 'has-success');

    group.hasClass('has-feedback')
      && feedback.removeClass(this.options.feedback.error)
      && feedback.removeClass(this.options.feedback.success)
      && getValue(el)
      && feedback.addClass(this.options.feedback.success)
      && group.addClass('has-success');
  }

  FormValidator.prototype.hasErrors = function () {
    function fieldErrors() {
      return !!((this.element && this.element.validatorErrors) || []).length;
    }

    return !!this.inputs.filter(fieldErrors).length();
  }

  FormValidator.prototype.isIncomplete = function () {
    function fieldIncomplete() {
      var value = getValue(this);
      return !(typeof value === 'string' ? value.trim() : value);
    }

    return !!this.inputs.filter('[required]').filter(fieldIncomplete).length();
  }

  FormValidator.prototype.onSubmit = function (e) {
    this.validate();
    if (this.isIncomplete() || this.hasErrors()) e.preventDefault();
  }

  FormValidator.prototype.toggleSubmit = function () {
    if (!this.options.disable) return;

    var self = this;

    this.buttons.each(function() {
      this.toggleClass('disabled', self.isIncomplete() || self.hasErrors());
    })
  }

  FormValidator.prototype.defer = function (el, callback) {
    callback = callback.bind(this, el);
    if (!this.options.delay) return callback();

    window.clearTimeout(el.element.validatorTimeout);
    el.element.validatorTimeout = window.setTimeout(callback, this.options.delay);
  }

  FormValidator.prototype.reset = function () {
    var self = this;

    this.form.findAll('.form-control-feedback').each(function() {
      this.removeClass(self.options.feedback.error, self.options.feedback.success);
    })

    this.inputs
      .each(function () {
        this.element.validatorErrors = null;

        var timeout = this.element.validatorTimeout;
        window.clearTimeout(timeout) && (this.element.validatorTimeout = null);
      })

    this.form.findAll('.help-block.with-errors').each(function () {
      var originalContent = this.element.validatorOriginalContent;

      this.element.validatorOriginalContent = null;
      this.html(originalContent);
    });

    this.buttons.each(function() {
      this.removeClass('disabled');
    });

    this.form.findAll('.has-error, .has-danger, .has-success').each(function() {
      this.removeClass('has-error', 'has-danger', 'has-success');
    })

    return this;
  }

  FormValidator.prototype.destroy = function () {
    this.reset();

    this.removeAttr('novalidate');
    this.form.validator = null;
    this.off('.bs.validator');

    this.inputs.each(function() {
      this.off('.bs.validator');
    })

    this.options = null;
    this.validators = null;
    this.form = null;
    this.buttons = null;
    this.inputs = null;

    return this;
  }

  function getValue(el) {
    return el.is('[type="checkbox"]') ? el.prop('checked') :
           el.is('[type="radio"]') ? !!dom.findOne('[name="' + el.attr('name') + '"]:checked').element :
           el.is('select[multiple]') ? (el.val() || []).length :
           el.val();
  }

  this.init();
}
