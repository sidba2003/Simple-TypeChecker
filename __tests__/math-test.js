const Type = require('../src/Type');

const {test} = require('./test-util');

module.exports = tc => {
    test(tc, ['+', 2, 3], Type.number),
    test(tc, ['-', 2, 3], Type.number),
    test(tc, ['/', 2, 3], Type.number),
    test(tc, ['*', 2, 3], Type.number),

    test(tc, ['+', '"Hello, "', '"world!"'], Type.string)
};