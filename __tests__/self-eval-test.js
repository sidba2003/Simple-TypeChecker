const Type = require('../src/Type');

const {test} = require('./test-util');

module.exports = tc => {
    test(tc, 42, Type.number),
    test(tc, '"Hello, world!"', Type.string);
    test(tc, true, Type.boolean);
    test(tc, false, Type.boolean);
};