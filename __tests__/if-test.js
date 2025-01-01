const Type = require('../src/Type');

const {exec, test} = require('./test-util');

module.exports = tc => {
    test(tc, `(<= 1 10)`, Type.boolean),
    test(tc,
    `
        (var x 10)
        (var y 20)
        (if (<= x 10)
            (set y 1)
            (set y 2))
        y
    `,
    Type.number)
};