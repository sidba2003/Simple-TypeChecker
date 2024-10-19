const Type = require('../src/Type.js');
const {test} = require('./test-util.js');

module.exports = typeChecker => {
    test(
        typeChecker,
        ['begin',
            ['var', 'x', 10],
            ['var', 'y', 20],
            ['+', ['*', 'x', 10], 'y']
        ],
        Type.number
    );

    test(
        typeChecker,
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'x', '"hello"'],
                ['+', 'x', '"world"']
            ],
            ['-', 'x', 5]
        ],
        Type.number
    );

    test(
        typeChecker,
        ['begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'y', 5],
                ['set', 'x', ['+', 'x', 'y']]
            ],
            ['-', 'x', 5]
        ],
        Type.number
    );

}