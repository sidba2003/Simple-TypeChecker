const assert = require('assert');
const parser = require('../parser/parser.js');

function exec(typeChecker, exp){
    if (typeof exp === 'string'){
        exp = parser.parse(`(begin ${exp})`);
    }
    return typeChecker._tcGlobal(exp);
}

function test(typeChecker, exp, expected){
    const actual = exec(typeChecker, exp);

    try{
        assert.strictEqual(actual.equals(expected), true);
    } catch(err){
        console.log(`Expected ${expected} but got ${actual} for ${exp}`)
        throw err;
    }
}

module.exports = {
    exec, 
    test
};