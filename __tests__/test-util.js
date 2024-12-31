const assert = require('assert');
const parser = require('../parser/parser.js');

function exec(tc, exp){
    if (typeof exp === 'string'){
        exp = parser.parse(`(begin ${exp})`);
    }

    return tc.tcGlobal(exp);
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