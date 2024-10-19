const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(typeChecker, `(<= 1 10)`, Type.boolean);

    test(typeChecker,
        `
            (var x 10)
            (var y 20)

            (if (<= x 10)
                (set y 1)
                (set y 2))
            y
        `, Type.number
    )
}