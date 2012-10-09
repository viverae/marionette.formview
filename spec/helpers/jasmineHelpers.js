var matchers = {
  toFail: function(expected) {
    return Marionette.FormView.prototype.validateRule(this.actual,expected) === false;
  },
  toPass: function(expected) {
    return Marionette.FormView.prototype.validateRule(this.actual,expected) === true;
  }
};

beforeEach(function() {
  this.addMatchers(matchers);
});
