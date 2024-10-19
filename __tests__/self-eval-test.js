const test_util = require('./test-util.js')
const Type = require('../src/Type.js');

module.exports = typeChecker => {
    test_util.test(typeChecker, 1, Type.number);
    test_util.test(typeChecker, '"string"', Type.string);
    test_util.test(typeChecker, true, Type.boolean);
    test_util.test(typeChecker, false, Type.boolean);
}