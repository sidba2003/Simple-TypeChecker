const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(typeChecker,
        `(def square ((x number)) -> number 
            (* x x))`,
        Type.fromString('Fn<number<number>>')
    );

    test(typeChecker,
        `
        (def calc ((x number) (y number)) -> number
            (begin
                (var z 30)
                (+ (* x y) z)
            ))`, 
        Type.fromString('Fn<number<number,number>>')
    );
}