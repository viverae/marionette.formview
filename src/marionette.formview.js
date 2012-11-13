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

      this.bindTo(this.model, 'change', this.changeFieldVal,this);
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
        if (el) data[field] = this.getInputVal(el);
      }
      _.each(this.fields, _(getFieldData).bind(this));

      return data;
    },

    beforeFormSubmit : function (e) {
      var errors = this.validate();
      var success = _.isEmpty(errors);
      if (success) {
        if (_.isFunction(this.onSubmit)) return this.onSubmit.apply(this, [e]);
      } else {
        if (_.isFunction(this.onSubmitFail)) this.onSubmitFail.apply(this, [errors]);
        e.stopImmediatePropagation();
        return false;
      }
    },

    onFieldEvent : function(evt) {
      this.handleFieldEvent(evt, evt.type);
    },

    handleFieldEvent : function(evt, eventName) {
      var el = evt.target || evt.srcElement,
        field = $(el).data('model-attribute'),
        fieldOptions = this.fields[field];

      if (fieldOptions && fieldOptions.validateOn === eventName) {
        var errors = this.validateField(field);
        if (!_.isEmpty(errors) && _.isFunction(this.onValidationFail)) this.onValidationFail(errors);
      }
    },

    validate : function () {
      var errors = {},
        fields = _(this.fields).keys();

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
        isValid = true;

      var el = this.$(fieldOptions.el),
        val = this.getInputVal(el);

      if (fieldOptions.required) {
        isValid = this.validateRule(val,'required');
        var errorMessage = typeof fieldOptions.required === 'string' ? fieldOptions.required : 'This field is required';
        if (!isValid) fieldErrors.push(errorMessage);
      }

      // Don't bother with other validations if failed 'required' already
      if (isValid && validations) {
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
        return errorObject;
      }
    },

    getInputVal : function(el) {
      if (!el) return '';
      if (!el.jQuery) el = this.$(el);

      var val;

      if (el.is('input')) {
        var inputType = el.attr('type').toLowerCase();
        switch (inputType) {
          case "radio":
          case "checkbox":
            val = el.is(':checked');
            break;
          default :
            val = $.trim(el.val());
            break;
        }
      } else {
        if (el.is('textarea')) val = el.text();
        if (el.is('select')) {
          val = $.trim(el.val());
        }
        //Handle Select / MultiSelect Etc
        //@todo
      }

      return val;
    },

    validateRule : function (val,validationRule) {
      var options;

      // throw an error because it could be tough to troubleshoot if we just return false
      if (!validationRule) throw new Error('Not passed a validation to test');

      if (validationRule === 'required') return FormValidator.required(val);

      if (validationRule.indexOf(':') !== -1) {
        options = validationRule.split(":");
        validationRule = options.shift();
      }

      if (this.rules && this.rules[validationRule]) {
        return _(this.rules[validationRule]).bind(this)(val);
      } else {
        return _(FormValidator.validate).bind(this)(validationRule, val, options);
      }
      return true;
    },

    submit : function () {
      this.form.submit();
    },

    bindFormEvents : function() {
      var form = (this.$el.is('form')) ? this.$el : this.$('form').first();
      this.form = form;

      this.$('input')
        .blur(_(this.onFieldEvent).bind(this))
        .keyup(_(this.onFieldEvent).bind(this))
        .keydown(_(this.onFieldEvent).bind(this))
        .change(_(this.onFieldEvent).bind(this));

      form.submit(_(this.beforeFormSubmit).bind(this));
    },

    runInitializers : function() {
      this.populateFields();
      this.bindFormEvents();
      if (_.isFunction(this.onReady)) this.onReady();
    }
  });

  var FormValidator = {

    regex : {
      //RFC 2822
      email : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
      alpha : /^[a-zA-Z]+$/,
      alphanum : /^[a-zA-Z0-9]+$/
    },

    validate : function(validator, val, options) {
      if (_.isFunction(FormValidator[validator])) return _(FormValidator[validator]).bind(this)(val,options);
      throw new Error('Validator does not exist : ' + validator);
    },

    matches : function(val,field) {
      /*jshint eqeqeq:false*/
      var el = this.fields[field[0]].el;
      return val == this.getInputVal(el);
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
      return FormValidator.regex.alpha.test(val);
    },

    alphanum : function (val) {
      return FormValidator.regex.alphanum.test(val);
    },

    email : function(val) {
      return FormValidator.regex.email.test(val);
    },

    required : function(val) {
      if (val === false || _.isNull(val) || _.isUndefined(val) ||  (_.isString(val) && val.length === 0)) return false;
      return true;
    },

    boolean : function(val) {
      return _.isBoolean(val);
    }
  };

  return FormView;
}));
