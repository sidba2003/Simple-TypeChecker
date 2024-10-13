const test_util = require('./test-util.js')

module.exports = typeChecker => {
    test_util.test(typeChecker, 1, 'number');
    test_util.test(typeChecker, '"string"', 'string');
}