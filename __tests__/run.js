const TC =  require('../src/tc.js');

const tests = [
    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./variable-test.js')
]


const typeChecker = new TC();

tests.forEach(test => test(typeChecker));

console.log('All assertions have passed!');