const assert = require('assert');

function exec(typeChecker, exp){
    return typeChecker.tc(exp);
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