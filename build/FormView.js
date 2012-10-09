/*! marionette-formview - v0.1.0 - 2012-10-08 */

/*jshint*/
/*global Backbone,define*/

;(function (root, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['marionette','jquery','underscore'], factory);
  } else {
    // Browser globals
    root.Marionette.FormView = factory(root.Marionette,root.jQuery,root._);
  }
}(this, function (Marionette,$,_) {
  "use strict";

  /**
   * FormView Extension of Backbone.Marionette.ItemView
   *
   * @param {Object} options                   Options defining this FormView
   * @param {Object} [options.data]            Form Data. (Required if options.model is not set)
   *
   * @param {Object} [options.fields]          Which Fields to include
   *
   */
  var FormView = Marionette.ItemView.extend({
    tagName : 'form',

    className : "formView",

    defaults : {
      field  : {
        validateOn : 'submit'
      }
    },
    rules   : {}, //Custom Field Validation Rules
    fields  : {}, //Fields Merged with Defaults

    constructor : function(){
      Marionette.ItemView.prototype.constructor.apply(this, arguments);

      //Allow Passing In Fields by extending with a fields hash
      if (!this.fields) throw new Error("Fields Must Be Provided");

      if (!this.model) this.model = new Backbone.Model();

      this.model.bind('change', this.changeFieldVal,this);
      if (this.data) this.model.set(this.data);

      //Attach Events to preexisting elements if we don't have a template
      if (!this.template) this.runInitializers();
      this.on('item:rendered',this.runInitializers, this);
    },

    changeFieldVal : function(model, fields) {
      var modelProperty = Object.keys(fields.changes),
        field = this.fields[modelProperty],
        domItem = this.$(field.el);

      if(domItem) domItem.val(this.model.get(modelProperty));
    },

    populateFields : function () {
      _(this.fields).each(function(options,field) {
        var value = this.model.get(field);

        this.$(options.el).data('model-attribute', field);
        if (typeof value === 'undefined') value = '';
        this.$(options.el).val(value);
      },this);
    },

    serializeFormData : function () {
      var data = {};

      function getFieldData(options,field) {
        /*jshint validthis:true*/
        var el = this.$(options.el);
        if (el) data[field] = el.val() || el.text() || '';
      }
      _.each(this.fields, _(getFieldData).bind(this));

      return data;
    },

    beforeFormSubmit : function (evt) {
      evt.preventDefault();
      var errors = this.validate(),
       success = _.isEmpty(errors);

      if (!success && _.isFunction(this.onSubmitError)) {
        this.onSubmitError.apply(this, [errors]);
        return;
      }

      if (_.isFunction(this.onSubmit)) return this.onSubmit.apply(this, [e]);
    },

    inputBlur  : function (evt) {
      var el = evt.target || evt.srcElement,
        modelField = $(el).data('model-attribute'),
        currentField = this.fields[modelField],
        fieldVal = this.$(el).val();

      //If Not In the model we don't care about it
      if (currentField && currentField.validateOn === 'blur') {
        this.handleBlurValidation(modelField, el, fieldVal);
      }
    },

    //If We want Support for keyup validation (passwords, etc)
    inputKeyUp : function () { /*noop*/ },

    handleBlurValidation : function (field, domEl, val) {
      var data = {};
      data[field] = val;

      var errors = this.validate(data);

      if (!_.isEmpty(errors)) {
        if (_.isFunction(this.onSubmitFail)) this.onSubmitFail.call(this, errors);
        return false;
      }
    },

    validate : function () {
      var self = this,
          errors = {};

      var fields = _(this.fields).keys();

      _(fields).each(function (field) {
        var fieldErrors = this.validateField(field);
        if (!_.isEmpty(fieldErrors)) errors[field] = fieldErrors;
      },this);
      return errors;
    },

    validateField : function(field) {
      var fieldOptions = this.fields[field],
        validations = fieldOptions && fieldOptions.validations ? fieldOptions.validations : {},
        fieldErrors = [],
        isValid;

      var el = this.$(fieldOptions.el),val;

      val = el && (el.val ? el.val() : el.text()) || '';
      val = $.trim(val);

      if (fieldOptions.required) {
        isValid = this.validateRule(val,'required');
        if (!isValid) fieldErrors.push('This field is required');
      } else if (validations) {

        _.each(validations, function (errorMsg, validateWith) {
          isValid = this.validateRule(val, validateWith);
          if (!isValid) fieldErrors.push(errorMsg);
        },this);

      }

      if (!_.isEmpty(fieldErrors)) {
        var errorObject = {
          field : field,
          el : this.fields[field].el,
          error : fieldErrors
        };
        if (_.isFunction(this.onFieldError)) this.onFieldError(errorObject);
        return errorObject;
      }
    },

    validateRule : function (val,validationRule) {
      var options;

      // throw an error because it could be tough to troubleshoot if we just return false
      if (!validationRule) throw new Error('Not passed a validation to test');

      if (validationRule === 'required') return !!val;

      if (validationRule.indexOf(':') !== -1) {
        options = validationRule.split(":");
        validationRule = options.shift();
      }

      if (this.rules && this.rules[validationRule]) {
        return this.rules[validationRule](val);
      } else {
        return FormValidator.validate(validationRule, val, options);
      }
      return true;
    },

    submit : function (data) {
      this.form.submit();
    },

    bindFormEvents : function() {
      var form = (this.$el.is('form')) ? this.$el : this.$('form').first();
      this.form = form;

      this.$('input')
        .blur(this.inputBlur.bind(this))
        .keyup(this.inputKeyUp.bind(this));

      form.submit(this.beforeFormSubmit.bind(this));
    },

    runInitializers : function() {
      this.populateFields();
      this.bindFormEvents();
    },

    //Forms Using Query String Data
    getQueryParam : function(param) {
       param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
       var regParam = "[\\?&]" + param + "=([^&#]*)",
          regex = new RegExp(regParam),
          results = regex.exec(window.location.href);
       if (!results) return false;
       return decodeURIComponent(results[1].replace(/\+/g, " "));
     }

  });

  var FormValidator = {

     regex : {
       //RFC ????
       email : /^[a-zA-Z0-9!#$%&'*\+\/=?\^_`{|}~\-]+(?:\\.[a-zA-Z0-9!#$%&'*\+\/=?\^_`{|}~\-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\\.)+([a-zA-Z0-9]){2,3}$/,
       alpha : /^[a-zA-Z]+$/,
       alphanum : /^[a-zA-Z0-9]+$/
     },

      validate : function(validator, val, options) {
        if (_.isFunction(this[validator])) return this[validator](val,options);
        throw new Error('Validator does not exist - %s', validator);
      },

      min : function(val,minLength) {
        if (val.length < minLength) return false;
        return true;
      },

      max : function(val, maxLength) {
        if (val.length > maxLength) return false;
        return true;
      },

      numeric : function(val) {
        return _.isNumber(val);
      },

      alpha : function(val) {
        return this.regex.alpha.test(val);
      },

      alphanum : function (val) {
        return this.regex.alphanum.test(val);
      },

      email : function(val) {
        return this.regex.email.test(val);
      },

      required : function(val) {
        if (_.isNull(val) || _.isUndefined(val) ||  (_.isString(val) && val.length === 0)) return false;
        return true;
      },

      boolean : function(val) {
        return _.isBoolean(val);
      }
  };

  return FormView;
}));
