const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(typeChecker,
        `
            (var x 10)

            (while (<= x 10)
                (set x (- x 1)))

        `, Type.number
    );
}