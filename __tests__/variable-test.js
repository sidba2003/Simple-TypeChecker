const Type = require('../src/Type');

const {test} = require('./test-util');

module.exports = tc => {
    test(tc, ['var', 'x', 3], Type.number),
    test(tc, 'x', Type.number),

    test(tc, ['var', ['y', 'string'], '"Hello, world!"'], Type.string),
    test(tc, 'y', test.string);
    
    test(tc, 'VERSION', Type.string);
};