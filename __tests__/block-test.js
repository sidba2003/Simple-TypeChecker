/**
 * Typed Eva: static typecheker.
 *
 * (C) 2022-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Type = require('../src/Type');

const {exec, test} = require('./test-util');

module.exports = tc => {
    test(tc,
        ['begin',
            ['var', 'x', 10],
            ['var', 'y', 20],
            ['+', ['*', 'x', 10], 'y']],
        Type.number)

    test(tc,
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'y', 0],
                ['set', 'x', ['+', 'y', 'x']],
                ['+', 'x', 'y']],
            ['-', 'x', 5]],
        Type.number)
};