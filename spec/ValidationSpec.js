/*globals Marionette, beforeEach, $, require, jasmine, describe, it, expect, loadFixtures, Backbone*/


describe('Validations',function(){
  "use strict";

  var FormView;

  beforeEach(function(){
    FormView = Marionette.FormView;
  });

  describe('required',function(){
    it('Should fail on all falsey fields',function(){
      expect(0).toFail('required');
      expect(undefined).toFail('required');
      expect(false).toFail('required');
      expect('').toFail('required');
    });

    it('Should pass on all truthy fields',function(){
      expect(1).toPass('required');
      expect("foo").toPass('required');
    });
  });

});

