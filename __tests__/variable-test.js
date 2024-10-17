const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(typeChecker, ['var', 'x', 10], Type.number);
    test(typeChecker, ['var', ['a', 'number'], 'x'], Type.number);

    test(typeChecker, 'x', Type.number);
    test(typeChecker, 'a', Type.number);

    test(typeChecker, 'VERSION', Type.string);
}