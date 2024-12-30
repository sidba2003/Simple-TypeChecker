const typechecker = require('../src/tc');

const Tests = [
    require('./self-eval-test.js')
]

const tc = new typechecker();

Tests.forEach(test => test(tc));

console.log("All assertions have passed!");
