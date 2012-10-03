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
   */

  var FormView = Marionette.ItemView.extend({

    className : "formView",

    defaults : {
      form  : {},
      field : {
        validateOn : 'submit'
      }
    },

    ui : {
      form   : "form",
      submit : "input[type='submit']"
    },

    events : {
      "submit form" : "beforeFormSubmit",
      "blur input"  : "inputBlur",
      "keyup input" : "inputKeyUp"
    },

    fields         : {}, //Fields Merged with Defaults
    coreValidators : {},
    validators     : {}, //Custom Field Validators

    initialize : function () {
      this.options = _.defaults(this.options, this.defaults.form);
      this.model = this.options.model || null;
      if (this.options.onSubmit) this.onSubmit = this.options.onSubmit;

      //Allow Passing In Fields by this.model.fields extending with a fields hash or passing fields to constructor
      var hasFields = (this.model && !_.isEmpty(this.model.fields)) || !_.isEmpty(this.options.fields || this.fields);
      if (!hasFields) throw new Error("Fields Must Be Provided");

      if (!this.model) {
        this.data = this.options.data || {};
        this.createBaseModel();
      }

      if (!this.template) this.runInitializers();
    },

    createBaseModel : function () {
      var BaseModel = Backbone.Model.extend({});
      this.model = new BaseModel();
      this.model.fields = this.options.fields || this.fields;
      this.model.validators = this.options.validators || {};
      if (this.data) this.model.set(this.data);
    },

    attachFields : function () {
      for (var field in this.model.fields) {
        var fieldOptions = _.defaults(this.model.fields[field], this.defaults.field),
          fieldVal = this.model.get(field);
        this.setDataModelAttr(fieldOptions.el, field);
        this.setDomModelField(field, fieldOptions);
        if (fieldVal) this.populateField(field, fieldVal);
      }
    },

    attachValidators : function () {
      var validators = this.model.validators;
      if (validators) this.validators = validators;
    },

    setDataModelAttr : function (el, field) {
      this.$(el).attr('data-model', field);
    },

    setDomModelField : function (field, options) {
      this.fields[field] = options;
    },

    populateField : function (field, value) {
      this.$(this.fields[field].el).val(value);
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
      var formData = this.serializeFormData();
      if (_.isFunction(this.onSubmit)) this.onSubmit.call(this, formData);
      this.validate(function (errors) {
        if (errors) {
          if (_.isFunction(this.onSubmitError)) this.onSubmitError.call(this, errors);
          return false;
        }
        this.submit(formData);
      });
    },

    inputBlur  : function (e) {
      console.log("BLUR");
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
      console.log("HAS BLUR VALIDATIONS");
      console.log(domEl);
      console.log(val);
    },

    validate : function (cb) {
      var self = this,
        errors = null,
        serializedModel = this.model.toJSON();

      _.each(serializedModel, function (val, field) {
        console.log(val);
        var fieldOptions = self.fields[field],
          validations = fieldOptions && fieldOptions.validations ? fieldOptions.validations : {};
        if (validations) {
          _.each(validations, function (errorMsg, validator) {
            self.validateField(field, val, validator, errorMsg);
          });
        }
      });
      if (_.isFunction(cb)) cb.call(this, errors);
    },

    //(field, val, validator, errorMsg)
    validateField : function () {

      //All Valid Until Implemented
      return true;
      /*
       //LOOK UP THE VALIDATOR FROM this.fields
       if (!validator) { }

       //Custom Validator
       if (this.validators[validator]) {
       console.log('custom validator');

       } else {
       console.log('core validator');
       }
       */
    },

    submit : function (data) {
      if (typeof this.onSubmit === 'function') this.onSubmit(data);
      else console.log("onSubmit Must Be Defined");
    },

    runInitializers : function() {
      this.attachFields();
      this.attachValidators();
    },

    onRender : function () {
      this.runInitializers();
    }
  });

  return FormView;
}));