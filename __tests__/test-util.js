const assert = require('assert');

function exec(tc, exp){
    return tc.tc(exp);
}

function test(tc, exp, expected){
    const actual = exec(tc, exp);
    try {
        assert.strictEqual(actual.equals(expected), true);
    } catch (e) {
        console.log(`Expected ${expected} type for ${exp}, but got ${actual}`);
        throw e;
    }
}


module.exports = {
    exec, 
    test
}