const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(typeChecker,
        `(def square ((x number)) -> number 
            (* x x))
        (square 2)`, Type.number);

    test(typeChecker,
        `
        (def calc ((x number) (y number)) -> number
            (begin
                (var z 30)
                (+ (* x y) z)
            ))
            
        (calc 10 20)`, Type.number);
    
        test(typeChecker,
            `
                (def factorial ((x number)) -> number
                    (factorial (- x 1)))
                (factorial 5)
            `, Type.number
        );
}