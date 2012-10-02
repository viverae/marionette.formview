/*globals $, require, jasmine, describe, it, expect*/

describe("FormView", function () {

  beforeEach(function () {
    loadFixtures("formTemplate.html");
  });

  it("Should Have a Base Model With Data as Fields", function () {
    var options = {
        template : "#form-template",
        fields : { fname : { el : ".fname" }},
        data     : {
          fname    : 'firstName'
        }
      },
      form = new Backbone.Marionette.FormView(options).render();

    expect(form.model.toJSON()).toEqual(options.data);
  });

  it("Should Have a Model Property Matching Model Default Field", function () {
    var modelDefaults = { fname : 'firstName' },
      Model = Backbone.Model.extend({
        fields : { fname : { el : ".fname" }},
        defaults : modelDefaults
      }),
      options = {
        template : "#form-template",
        model    : new Model()
      },
      form = new Backbone.Marionette.FormView(options).render();

    expect(form.model.toJSON()).toEqual(modelDefaults);
  });

  it("Should have a the fields hash passed into construct", function () {
    var fieldsHash = {
        fname : {
          el : ".fname"
        }
      },
      Model = Backbone.Model.extend({
        fields : fieldsHash
      });

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      model    : new Model()
    }).render();

    expect(form.model.fields).toEqual(fieldsHash);
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

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      data     : dataHash,
      fields   : fieldsHash
    }).render();

    expect(form.model).toBeTruthy();
    expect(form.model.get('fname')).toBe(dataHash.fname);
  });

  it("Should set the data-model property of the model field", function () {
    var fieldsHash = {
        fname : {
          el : ".fname"
        }
      };

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      fields   : fieldsHash
    }).render();

    expect(form.model).toBeTruthy();

  });


  it("Should have a the instance of onSubmit passed into construct", function () {
    var Model = Backbone.Model.extend({}),
      onSubmit = function () {
        console.log("onSubmit Called");
      };

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      fields   : {
        fname : {
          el : ".fname"
        }
      },
      model    : new Model(),
      onSubmit : onSubmit
    }).render();

    expect(form.onSubmit).toEqual(onSubmit);
  });

  it("Should Call OnSubmit", function () {

    var Model = Backbone.Model.extend({
        defaults : {
          email : 'an@example.com'
        }
      }),
      submit = jasmine.createSpy();

    var form = new Backbone.Marionette.FormView({
      template : "#form-template",
      fields   : {
        fname : {
          el : ".fname"
        }
      },
      model    : new Model(),
      onSubmit : submit
    }).render();

    form.ui.form.submit();

    expect(submit).toHaveBeenCalled();
  });


});
