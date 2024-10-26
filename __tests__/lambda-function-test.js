const {test} = require('./test-util.js');
const Type = require('../src/Type.js');

module.exports = typeChecker => {
    test(typeChecker,
        `(lambda ((x number)) -> number (* x x))`,
        Type.fromString('Fn<number<number>>')
    ); 

    test(typeChecker,
        `(var x:Fn<number<number>> (lambda ((x number)) -> number (* x x)))`,
        Type.fromString('Fn<number<number>>')
    ); 
}