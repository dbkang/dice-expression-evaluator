'use strict';

var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

// Dice type represents a group of identical dice with a specified number of sides.
// Coefficient can be set to -1 to represent dice that roll negative values
// In the future coefficient may be set to something other than 1 or -1 to reflect
// dice expressions with coefficients or multipliers.
function Dice(count, sides) {
  this.diceCount = count;
  this.sideCount = sides;
  this.coefficient = 1;
}

// returns minimum possible roll
Dice.prototype.min = function () {
  return (this.coefficient > 0) ?
    this.diceCount * this.coefficient :
    this.diceCount * this.sideCount * this.coefficient;
};

// returns maximum possible roll
Dice.prototype.max = function () {
  return (this.coefficient > 0) ?
    this.diceCount * this.sideCount * this.coefficient :
    this.diceCount * this.coefficient;
};

// returns total as well as components, in the form of { roll: t, dice: d } where t is the sum of all
// dice rolls and d is an array that contains each die roll;
Dice.prototype.roll = function () {
  var rolls = [];
  var sum = 0;
  for (var i = 0; i < this.diceCount; i++) {
    var roll = random.integer(1, this.sideCount) * this.coefficient;
    rolls.push(roll);
    sum += roll;
  }
  return {roll: sum, dice: rolls};
};

// set dice to return negative values;
Dice.prototype.setMinus = function () {
  this.coefficient = -1;
};

function ConstantDie(num) {
  this.value = num;
}

// min, max and roll essentially perform the same functionality for constant die, with roll returning
// the same information in a slightly different format
ConstantDie.prototype.min = function () {
  return this.value;
};

ConstantDie.prototype.max = ConstantDie.prototype.min;

ConstantDie.prototype.roll = function () {
  return {roll: this.value, dice: [this.value]};
};

// set constant die to a negative value
ConstantDie.prototype.setMinus = function () {
  this.value = -Math.abs(this.value); // abs to allow it to be called multiple times.
};

module.exports = {
  Dice: Dice,
  ConstantDie: ConstantDie
};
