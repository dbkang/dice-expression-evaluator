'use strict';

var parser = require("./parser.js");

// Polyfill from MDN
Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}

function DiceExpression(exp) {
  var self = simpleRoll;
  function simpleRoll() {
    return self.roll().roll;
  }
  self.dice = parser.parseDiceExpression(exp);
  Object.setPrototypeOf(self, DiceExpression.prototype);
  return self;
}

function sum(arr) {
  var result = 0;
  for (var i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}

DiceExpression.prototype.roll = function () {
  var results = this.dice.map(function (x) {
    return x.roll();
  });
  var diceRaw = results.map(function (roll) {
    return roll.dice;
  });
  var diceSums = diceRaw.map(sum);
  var roll = sum(diceSums);

  return {
    roll: roll,
    diceSums: diceSums,
    diceRaw: diceRaw
  };
};

DiceExpression.prototype.min = function () {
  return sum(this.dice.map(function (x) {
    return x.min();
  }));
};

DiceExpression.prototype.max = function () {
  return sum(this.dice.map(function (x) {
    return x.max();
  }));
};

module.exports = DiceExpression;
