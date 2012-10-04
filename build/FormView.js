/*! marionette-formview - v0.1.0 - 2012-10-04 */

;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['marionette'], factory);
  } else {
    // Browser globals
    root.Backbone.Marionette.FormView = factory(root.Backbone.Marionette);
  }
}(this, function (Marionette) {

  /**
   * FormView Extension of Backbone.Marionette.ItemView
   *
   * @param {Object} options                   Options defining this FormView
   * @param {Model} [options.model]            The Model relating to the form. (Required if options.data is not set)
   * @param {Object} [options.data]            Form Data. (Required if options.model is not set)
   *
   * @param {Object} [options.fields]          Which Fields to include
   * @param {String} [options.template]        Form template key/name
   *
   * @param {Function} [options.onSubmit]
   * @param {Function} [options.onSubmitError]
   * @param {Function} [options.onFieldError]
   */
  var FormView = Marionette.ItemView.extend({

    className : "formView",

    defaults : {
      form   : {},
      field  : {
        validateOn : 'submit'
      }
    },

    rules   : {}, //Custom Field Validation Rules
    fields  : {}, //Fields Merged with Defaults

    constructor : function(){
      Marionette.ItemView.prototype.constructor.apply(this, arguments);
      this.options = _.defaults(this.options, this.defaults.form);
      this.data = this.options.data || {};
      //Localize FormValidator
      this.validator = FormValidator;
      //Allow Passing In Fields by this.model.fields extending with a fields hash or passing fields to constructor
      var hasFields = (this.model && !_.isEmpty(this.model.fields)) || !_.isEmpty(this.options.fields || this.fields);
      if (!hasFields) throw new Error("Fields Must Be Provided");

      //Attach Fields/Validation Rules to model
      if (this.model) this.bootstrapModel();
      //Create Model / Attach Fields/Validation Rules
      else this.createBaseModel();
      //Attach Events To Template
      if (!this.template) this.runInitializers();
      this.bindCallbacks();
    },

    bindCallbacks : function() {
      if (this.options.onSubmit) this.onSubmit = this.options.onSubmit;
      if (this.options.onSubmitError) this.onSubmitError = this.options.onSubmitError;
      if (this.options.onFieldError) this.onFieldError = this.options.onFieldError;
    },

    bootstrapModel : function() {
      this.model.fields = this.getFields();
      this.model.rules = this.getCustomRules();
      if (this.data) this.model.set(this.data);
    },

    getFields : function() {
      return this.options.fields || this.model.fields || this.fields;
    },

    getCustomRules : function() {
      return this.options.rules || this.model.rules || this.rules;
    },

    createBaseModel : function () {
      var BaseModel = Backbone.Model.extend();
      this.model = new BaseModel();
      this.bootstrapModel();
    },

    attachFields : function () {
      for (var field in this.model.fields) {
        var options = _.defaults(this.model.fields[field], this.defaults.field),
          fieldVal = this.model.get(field);

        this.$(options.el).attr('data-model', field);
        this.fields[field] = options;
        if (fieldVal) this.$(this.fields[field].el).val(fieldVal);
      }
    },

    attachRules : function () {
      var rules = this.model.rules;
      if (rules) this.rules = rules;
    },

    serializeFormData : function () {
      var self = this, data = {};
      _.each(this.fields, function (options, field) {
        var el = self.$(options.el);
        if (el) data[field] = el.val() || el.text() || '';
      });
      return data;
    },

    beforeFormSubmit : function (e) {
      e.preventDefault();
      var self = this;
      this.validate(function(errors) {
        if (!_.isEmpty(errors)) {
          if (_.isFunction(self.onSubmitError)) self.onSubmitError.call(self, errors);
          return false;
        }
        self.submit(this.serializeFormData());
      });
    },

    inputBlur  : function (e) {
      var el = e.target || e.srcElement,
        modelField = $(el).attr('data-model'),
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

      this.validate(function(errors){
        if (!_.isEmpty(errors)) {
          if (_.isFunction(self.onSubmitError)) self.onSubmitError.call(self, errors);
          return false;
        }
      }, data);
    },

    validate : function (cb, data) {
      var self = this,
        errors = {},
        serializedData = data || this.serializeFormData();

      _.each(serializedData, function (val, field) {
        var fieldOptions = self.fields[field],
          validations = fieldOptions && fieldOptions.validations ? fieldOptions.validations : {},
          fieldErrors = [];

        val = self.trim(val);

        if (validations) {
          _.each(validations, function (errorMsg, validateWith) {
            var isValid = self.validateField(field, val, validateWith);
            if (!isValid) fieldErrors.push(errorMsg);
          });

          if (!_.isEmpty(fieldErrors)) {
            if (_.isFunction(self.onFieldError)) self.onFieldError(field, self.fields[field].el, fieldErrors);
            errors[field] = {
              el : self.fields[field].el,
              val : val,
              errors : fieldErrors
            };
          }
        }
      });
      if (_.isFunction(cb)) cb.call(this, errors);
    },

    validateField : function (field,val,validationRule) {
      var options;
      if (validationRule.indexOf(':') !== -1) {
        options = validationRule.split(":");
        validationRule = options.shift();
      }

      if (this.rules[validationRule]) {
        return this.rules[validationRule](val);
      } else {
        return this.validator.validate(validationRule, val, options);
      }
      return true;
    },

    submit : function (data) {
      if (typeof this.onSubmit === 'function') this.onSubmit(data);
      else console.log("onSubmit Must Be Defined");

      //Should we be handling the model setting/saving??

    },

    bindFormEvents : function() {
      this.$('input').blur(this.inputBlur.bind(this));
      this.$('input').keyup(this.inputKeyUp.bind(this));
      this.$('form').submit(this.beforeFormSubmit.bind(this));
    },

    runInitializers : function() {
      this.attachFields();
      this.attachRules();
      this.bindFormEvents();
    },

    onRender : function () {
      this.runInitializers();
    },

    //Not Sure Where To Put This
    trim : function(val) {
      return val.replace(/^\s+|\s+$/g, "");
    }
  }),

   FormValidator = {

     regex : {
       //RFC ????
       email : /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+([a-zA-Z0-9]){2,3}$/,
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