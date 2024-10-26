const {test} = require('./test-util.js');
const Type = require('../src/Type.js');

module.exports = typeChecker => {
    test(typeChecker, '(sum 1 5)', Type.number);
    test(typeChecker, '(sum (square 2) 4)', Type.number);
}