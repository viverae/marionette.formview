/*globals Marionette, beforeEach, $, require, jasmine, describe, it, expect, loadFixtures, Backbone*/

describe("FormView", function () {
  "use strict";
  var stopSubmit, submitSpy;

  beforeEach(function () {
    loadFixtures("formTemplate.html");
    stopSubmit = function(e) {
      e.preventDefault();
      return false;
    };
    submitSpy = jasmine.createSpy('Submit Stub').andCallFake(stopSubmit);
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
    var submitError = jasmine.createSpy('Submit error');
    var form = new (Marionette.FormView.extend({
      template : "#form-template",
      fields : {
        fname : {
          el       : '.fname',
          required : true
        }
      },
      onSubmit : submitSpy,
      onSubmitError : submitError
    }))();
    form.render();
    form.submit();

    expect(submitError).toHaveBeenCalled();
    expect(submitSpy).toHaveBeenCalled();
  });

  xit("Should Call field errors on problem", function () {

    var submit = jasmine.createSpy();

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      fields   : {
        fname : {
          el : ".fname"
        }
      },
      model    : new Backbone.Model(),
      onSubmit : submit
    }).render();

    form.$('form').submit();

    expect(submit).toHaveBeenCalled();
  });

});
