# dice-expression-evaluator [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

`dice-expession-evaluator` is used to parse dice expressions and to evaluate them using simulated dice rolls.

## Installation

```sh
$ npm install --save dice-expression-evaluator
```

## Dice expressions

Dice expressions are used to specify calculations that are based on a series of dice rolls.
For example, this is a dice expression that represents a single, standard 6-sided die:

```
1d6
```

This can be shortened to:

```
d6
```

What if we rolled five of those dice at once and added up?

```
5d6
```

To roll two other 10-sided dice and subtract the sum of the two from above?

```
5d6 - 2d10
```

What if we also wanted to add 15 to ensure that the final result does not go below zero?

```
5d6 - 2d10 + 15
```

If the number of sides is 100, it can be replaced with a % sign (percentage, out of 100, got it?)

```
5d100 == 5d%
```

Dice expressions can also be specified as:

* Any string denoting a whole number (don't start with 0 or minus sign please) is a dice expression.
* Any string of form `x?(d|D)y` where x and y are both whole numbers (see warning above) is a dice expression.  ? means x is optional and (d|D) means either d or D works.
* Any string of form `x?(d|D)%` where x and y are both whole numbers is a dice expression.
* Any string of form DiceExpression + DiceExpression or form DiceExpression - DiceExpression is a dice expression.
* Leading or trailing spaces don't matter and neither do spaces between terms and operators.  Just like in math.

## API

```js
var DiceExpression = require('dice-expression-evaluator');

var d = new DiceExpression('2d5 + 4d2 + 10');
```
* `d()`: evaluates the dice expression by simulating dice rolls and returns the resulting roll
* `d.min()`: returns the minimum possible roll for the dice expression
* `d.max()`: returns the maximum possible roll for the dice expression
* `d.roll()`: evaluates the dice expression by simulating dice rolls and returns the resulting roll as well as the value for each term within dice the expression and the individual dice rolls within that term.


## Examples

```js
d() // 20
d() // 18
d() // 23
d.min() // 16
d.max() // 28
d.roll() // { roll: 23, diceSums: [7, 6, 10], diceRaw: [[3, 4], [1, 2, 2, 1], [10]] }

```

## Future plans

We may add support for

* Coefficients for terms so that we can multiply dice rolls by a constant value
* Other arithmetic operators
* Nested expressions using parantheses


## License

MIT © [Dan Kang]()


[npm-image]: https://badge.fury.io/js/dice-expression-evaluator.svg
[npm-url]: https://npmjs.org/package/dice-expression-evaluator
[travis-image]: https://travis-ci.org/dbkang/dice-expression-evaluator.svg?branch=master
[travis-url]: https://travis-ci.org/dbkang/dice-expression-evaluator
[daviddm-image]: https://david-dm.org/dbkang/dice-expression-evaluator.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/dbkang/dice-expression-evaluator
[coveralls-image]: https://coveralls.io/repos/dbkang/dice-expression-evaluator/badge.svg
[coveralls-url]: https://coveralls.io/r/dbkang/dice-expression-evaluator
