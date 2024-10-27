const TC =  require('../src/tc.js');

const tests = [
    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./variable-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
    require('./user-defined-functions.js'),
    require('./built-in-function-test.js'),
    require('./lambda-function-test.js'),
    require('./class-test.js')
]


const typeChecker = new TC();

tests.forEach(test => test(typeChecker));

console.log('All assertions have passed!');