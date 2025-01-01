const Type = require('../src/Type');

const {exec, test} = require('./test-util');

module.exports = tc => {
    test(tc,
    `
        (def square ((x number)) -> number 
            (* x x))
        (square 5)
    `,
    Type.number),
    test(tc,
        `
            (def random ((x number)) -> number 
                (random x))
            (random 5)
        `,
        Type.number)
};