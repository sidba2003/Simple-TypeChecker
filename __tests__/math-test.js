const {test} = require('./test-util.js');
const Type = require('../src/Type.js');

module.exports = typeChecker => {
    test(typeChecker, ['+', 1, 2], Type.number);
    test(typeChecker, ['-', 1, 2], Type.number);
    test(typeChecker, ['*', 1, 2], Type.number);
    test(typeChecker, ['/', 2, 1], Type.number);

    test(typeChecker, ['+', '"Hello, "', '"world"'], Type.string);
    test(typeChecker, ['+', '"Hello, "', 2], Type.string);
};