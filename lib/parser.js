'use strict';

var diceTypes = require("./dice-types.js");
var Dice = diceTypes.Dice;
var ConstantDie = diceTypes.ConstantDie;

// all matchers take a string as an argument and return null if the given string does not match
// otherwise they return an object in the form of { tokens: ts, rest: str } where ts is an array
// of tokens that were matched and rest is the remainder of string after those tokens are removed.

// matches a dice term in the given string and converts it to a Dice object.
function diceExpMatcher(str) {
  var match = /^([1-9][0-9]*)?(d|D)(([1-9][0-9]*)|\%)/.exec(str);
  if (match === null) {
    return null;
  }
  var diceCount = Number(match[1]) || 1;
  var sideCount = (match[3] === "%") ? 100 : Number(match[3]);
  var rest = str.slice(match[0].length);
  return {tokens: [new Dice(diceCount, sideCount)], rest: rest};
}

function constantMatcher(str) {
  var match = /^[1-9][0-9]*/.exec(str);
  if (match === null) {
    return null;
  }
  return {tokens: [new ConstantDie(Number(match[0]))], rest: str.slice(match[0].length)};
}

function spaceMatcher(str) {
  var match = /^[ ]*/.exec(str);
  return {tokens: [], rest: str.slice(match[0].length)};
}

function operatorMatcher(str) {
  var match = /^[+|-]/.exec(str);
  if (match === null) {
    return null;
  }
  return {tokens: [match[0]], rest: str.slice(1)};
}

// returns a matcher function that will first try matcher1 and if it does not match, try matcher2
// and returns the result
function orCombinator(matcher1, matcher2) {
  return function (str) {
    return matcher1(str) || matcher2(str);
  };
}

// Given dice expression in string, return an array where each item is either an instance of Dice
// or an instance of Constant.
//
// The basic algorithm relies on the fact that in a dice expression, terms (dice or constant
// expressions) and operators alternate with potentially spaces between them.  Therefore
// we can create a matcher rotation that we can apply in a loop without worrying about exactly
// which matcher it is.  We just need to check at the end whether the sequence ended properly as
// it cannot end with an operator.
function parseDiceExpression(exp) {
  var remaining = exp;
  var diceOrConstantMatcher = orCombinator(diceExpMatcher, constantMatcher);
  var matcherRotation = [spaceMatcher, diceOrConstantMatcher, spaceMatcher, operatorMatcher];
  var i = 0;
  var tokens = [];
  var result = [];
  while (remaining.length > 0) {
    var currentMatcher = matcherRotation[i];
    var matchResult = currentMatcher(remaining);
    if (matchResult) {
      tokens = tokens.concat(matchResult.tokens);
      remaining = matchResult.rest;
    } else {
      throw new Error("Parse error @ position " + (exp.length - remaining.length) + " - '" +
                      remaining.slice(Math.max(remaining.length, 10)));
    }
    i = (i + 1) % matcherRotation.length;
  }
  i = (i - 1 + matcherRotation.length) % matcherRotation.length; // last consumed token;
  if (i === 0 || i === 3) { // if we last consumed an operator or spaces following one
    throw new Error("Parse error @ end - expression cannot end with an operator");
  }

  var lastOperator = "+";
  for (var j = 0; j < tokens.length; j++) {
    if (typeof tokens[j] === "string") {
      lastOperator = tokens[j];
    } else {
      if (lastOperator === "-") {
        tokens[j].setMinus();
      }
      result.push(tokens[j]);
    }
  }
  return result;
}

module.exports = {
  diceExpMatcher: diceExpMatcher,
  constantMatcher: constantMatcher,
  spaceMatcher: spaceMatcher,
  operatorMatcher: operatorMatcher,
  orCombinator: orCombinator,
  parseDiceExpression: parseDiceExpression
};
