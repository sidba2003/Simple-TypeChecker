const Type = require('../src/Type');

const {exec, test} = require('./test-util');

module.exports = tc => {
    test(tc, `(<= 1 10)`, Type.boolean),
    test(tc,
    `
        (var x 10)
        (while (<= x 10)
            (set x 1)
        )
        x
    `,
    Type.number)
};