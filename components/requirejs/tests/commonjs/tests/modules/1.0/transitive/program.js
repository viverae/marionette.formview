define(["require", "exports", "module", "../../../../../../../.","a"], function(require, exports, module) {
var test = require('test');
test.assert(require('a').foo() == 1, 'transitive');
test.print('DONE', 'info');

});
