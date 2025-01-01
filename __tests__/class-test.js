const {test} = require('./test-util');
const Type = require('../src/Type');

module.exports = eva => {

  test(eva,
  `
    (class Point null
      (begin

        (var (x number) 0)
        (var (y number) 0)

        (def constructor ((self Point) (x number) (y number)) -> Point
          (begin
            (set (prop self x) x)
            (set (prop self y) y)
            self))

        (def calc ((self Point)) -> number
          (+ (prop self x) (prop self y)))))

    (var (p Point) (new Point 10 20))
    ((prop p calc) p)
  `,
  Type.number)
};