/*globals Marionette, beforeEach, $, require, jasmine, describe, it, expect, loadFixtures, Backbone*/

describe("FormView", function () {
  "use strict";
  var stopSubmit,
      submitSpy,
      submitFailSpy,
      validationErrorSpy;

  beforeEach(function () {
    loadFixtures("formTemplate.html");
    stopSubmit = function(e) {
      e.preventDefault();
      return false;
    };
    submitSpy = jasmine.createSpy('Submit').andCallFake(stopSubmit);
    submitFailSpy = jasmine.createSpy('Submit Fail');
    validationErrorSpy = jasmine.createSpy('Field Error');
  });

  it("Should create a base model from data and fields", function () {
    var fieldsHash = {
        fname : {
          el : ".fname"
        }
      },
      dataHash = {
        fname : 'test'
      };

    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      data     : dataHash,
      fields   : fieldsHash
    }))();
    form.render();

    expect(form.model.get('fname')).toBe(dataHash.fname);
  });

  it("Should populate fields from model", function () {
    var fieldsHash = {
        fname : {
          el : ".fname"
        }
      };
    var model = new Backbone.Model();
    model.set('fname','foo');

    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      fields   : fieldsHash,
      model    : model
    }))();
    form.render();

    expect(form.$('.fname').val()).toEqual(model.get('fname'));
  });

  it("Should Call onSubmit upon form submit click", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      onSubmit : submitSpy
    }))();
    form.render();
    form.$('input[type=submit]').click();

    expect(submitSpy).toHaveBeenCalled();
  });

  it("Should Call OnSubmit upon formview.submit()", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      onSubmit : submitSpy
    }))();
    form.render();
    form.submit();

    expect(submitSpy).toHaveBeenCalled();
  });

  it("Should call external submit event upon formview.submit()", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      fields   : {
        fname : {
          el : ".fname"
        }
      }
    }))();
    form.render();
    form.form.submit(submitSpy);
    form.submit();

    expect(submitSpy).toHaveBeenCalled();
  });

  it("Should Call OnSubmit upon actual form submission", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      onSubmit : submitSpy
    }))();
    form.render();
    form.form.submit();

    expect(submitSpy).toHaveBeenCalled();
  });

  it("Should call onSubmitError when a field does not pass validation", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      fields : {
        fname : {
          el       : '.fname',
          required : true
        }
      },
      onSubmit : submitSpy,
      onSubmitFail : submitFailSpy
    }))();
    form.render();
    form.submit();

    expect(submitFailSpy).toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("Should call onSubmitFail but not onSubmit and not actually submit when a field does not pass validation", function () {
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      fields : {
        fname : {
          el       : '.fname',
          required : true
        }
      },
      onSubmit : submitSpy,
      onSubmitFail : submitFailSpy
    }))();
    form.render();
    form.form.on('submit',submitSpy);
    form.submit();

    expect(submitFailSpy).toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("Should call field errors on field blur", function () {
    var form = new (Backbone.Marionette.FormView.extend({
      template : "#form-template",
      fields   : {
        fname : {
          el       : ".fname",
          required : true,
          validateOn : 'blur'
        }
      },
      onValidationFail : validationErrorSpy,
      onSubmitFail : submitFailSpy,
      onSubmit : submitSpy
    }))();

    form.render();

    form.$('.fname').focus().blur();

    expect(validationErrorSpy).toHaveBeenCalled();
    expect(submitFailSpy).not.toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();
  });

});
