const typechecker = require('../src/tc');

const Tests = [
    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
    require('./user-defined-function-test.js'),
    require('./class-test.js')
];

const tc = new typechecker();

Tests.forEach(test => test(tc));

console.log("All assertions have passed!");
