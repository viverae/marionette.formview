/*globals Marionette, beforeEach, $, require, jasmine, describe, it, expect, loadFixtures, Backbone*/


describe('Validations',function(){
  "use strict";

  var stopSubmit,
      submitSpy,
      submitFailSpy,
      validationErrorSpy,
      logSpy;

  beforeEach(function () {
    loadFixtures("formTemplate.html");
    stopSubmit = function(e) {
//      console.log(arguments);
      e.preventDefault();
      return false;
    };
    logSpy = function() {
//      console.log(arguments);
    };
    submitSpy = jasmine.createSpy('onSubmit').andCallFake(stopSubmit);
    submitFailSpy = jasmine.createSpy('onSubmitFail').andCallFake(logSpy);
    validationErrorSpy = jasmine.createSpy('onValidationFail').andCallFake(logSpy);
  });

  it('should call custom validations',function(){
    var form = new (Backbone.Marionette.FormView.extend({
      template         : "#form-template",
      fields           : {
        fname : {
          el         : ".fname",
          validateOn : 'blur',
          validations : {
            foo : 'BAR'
          }
        }
      },
      rules : {
        foo : function() {
          return false;
        }
      },
      onValidationFail : validationErrorSpy,
      onSubmitFail     : submitFailSpy,
      onSubmit         : submitSpy
    }))();

    form.render();

    form.$('[data-field="fname"]').blur();

    expect(validationErrorSpy).toHaveBeenCalledWith({
      el    : '.fname',
      error : ['BAR'],
      field : 'fname'
    });

    expect(submitFailSpy).not.toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();

    form.submit();

    expect(submitFailSpy).toHaveBeenCalledWith({
      fname : {
        el : ".fname",
        error : ['BAR'],
        field : 'fname'
      }
    });
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should be able to mix required and custom validations',function(){
    var form = new (Backbone.Marionette.FormView.extend({
      template         : "#form-template",
      fields           : {
        fname : {
          el         : ".fname",
          required   : true,
          validateOn : 'blur',
          validations : {
            foo : 'BAR'
          }
        }
      },
      rules : {
        foo : function() {
          return false;
        }
      },
      onValidationFail : validationErrorSpy,
      onSubmitFail     : submitFailSpy,
      onSubmit         : submitSpy
    }))();

    form.render();
    form.$('[data-field="fname"]').val('exists');
    form.submit();

    expect(submitFailSpy).toHaveBeenCalledWith({
      fname : {
        el : ".fname",
        error : ['BAR'],
        field : 'fname'
      }
    });
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should pass custom require string',function(){
    var form = new (Backbone.Marionette.FormView.extend({
      template         : "#form-template",
      fields           : {
        fname : {
          el         : ".fname",
          required   : "FOO REQUIRED"
        }
      },
      onSubmitFail     : submitFailSpy,
      onSubmit         : submitSpy
    }))();

    form.render();

    form.submit();

    expect(submitFailSpy).toHaveBeenCalledWith({
      fname : {
        el : ".fname",
        error : ['FOO REQUIRED'],
        field : 'fname'
      }
    });
    expect(submitSpy).not.toHaveBeenCalled();
  });

  describe('match',function(){
    it('should fail if a field does not match another',function(){
      var form = new (Backbone.Marionette.FormView.extend({
        template         : "#form-template",
        fields           : {
          pass1 : {
            el         : ".pass1"
          },
          pass2 : {
            el         : ".pass2",
            validations : {
              'matches:pass1' : "Should match"
            }
          }
        },
        onSubmitFail     : submitFailSpy,
        onSubmit         : submitSpy
      }))();

      form.render();
      form.$('[data-field="pass1"]').val('foo');
      form.$('[data-field="pass2"]').val('bar');
      form.submit();

      expect(submitFailSpy).toHaveBeenCalledWith({
        pass2 : {
          el : ".pass2",
          error : ['Should match'],
          field : 'pass2'
        }
      });
      expect(submitSpy).not.toHaveBeenCalled();

    });
    it('should pass if the field does match another',function(){
      var form = new (Backbone.Marionette.FormView.extend({
        template         : "#form-template",
        fields           : {
          pass1 : {
            el         : ".pass1"
          },
          pass2 : {
            el         : ".pass2",
            validations : {
              'matches:pass1' : "Should match"
            }
          }
        },
        onSubmitFail     : submitFailSpy,
        onSubmit         : submitSpy
      }))();

      form.render();
      form.$('[data-field="pass1"]').val('foo');
      form.$('[data-field="pass2"]').val('foo');
      form.submit();

      expect(submitFailSpy).not.toHaveBeenCalled();
      expect(submitSpy).toHaveBeenCalled();

    });
  });

  describe('required',function(){
    it('Should fail on undef, empty string, or false',function(){
      expect(undefined).toFail('required');
      expect(false).toFail('required');
      expect('').toFail('required');
    });

    it('Should pass on 0',function(){
      expect(0).toPass('required');
    });

    it('Should pass on all truthy fields',function(){
      expect(1).toPass('required');
      expect("foo").toPass('required');
    });

    it('should trump any other validations',function(){
      var form = new (Backbone.Marionette.FormView.extend({
        template         : "#form-template",
        fields           : {
          fname : {
            el         : ".fname",
            required   : "REQUIRED",
            validateOn : 'blur',
            validations : {
              foo : 'BAR'
            }
          }
        },
        rules : {
          foo : function() {
            return false;
          }
        },
        onValidationFail : validationErrorSpy,
        onSubmitFail     : submitFailSpy,
        onSubmit         : submitSpy
      }))();

      form.render();
      form.submit();

      expect(submitFailSpy).toHaveBeenCalledWith({
        fname : {
          el : ".fname",
          error : ["REQUIRED"],
          field : 'fname'
        }
      });
      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

});

