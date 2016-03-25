'use strict';

var should = require('should');
var parser = require("../lib/parser.js");
var diceTypes = require("../lib/dice-types.js");
var Dice = diceTypes.Dice;
var ConstantDie = diceTypes.ConstantDie;

describe("diceExpMatcher", function () {
  it("should accept dice expressions in the form of 4d5 or 4D5 and return result accordingly", function () {
    var exps = ["52d12 test", "52D12 test"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      var dice = result.tokens[0];
      dice.diceCount.should.equal(52);
      dice.sideCount.should.equal(12);
      result.rest.should.equal(" test");
    }
  });
  it("should accept dice expressions in the form of d55 or D55", function () {
    var exps = ["d23 remainder", "D23 remainder"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      var dice = result.tokens[0];
      dice.diceCount.should.equal(1);
      dice.sideCount.should.equal(23);
      result.rest.should.equal(" remainder");
    }
  });
  it("should accept dice expressions in the form of 12d% or 12D%", function () {
    var exps = ["4d% rest", "4D% rest"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      var dice = result.tokens[0];
      dice.diceCount.should.equal(4);
      dice.sideCount.should.equal(100);
      result.rest.should.equal(" rest");
    }
  });
  it("should accept dice expressions in the form of d% or D%", function () {
    var exps = ["d% period", "D% period"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      var dice = result.tokens[0];
      dice.diceCount.should.equal(1);
      dice.sideCount.should.equal(100);
      result.rest.should.equal(" period");
    }
  });
  it("should reject strings starting with non-numerical values other than d/D", function () {
    var exps = ["e% 2d5", "hey", "!23 4d3", "test   ", " invalid", "f100", " 2d5"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      should(result).be.null();
    }
  });
  it("should reject constants", function () {
    var exps = ["25", "0", "125", "1"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      should(result).be.null();
    }
  });
  it("should reject apparent dice expressions with zero dice or zero sides", function () {
    var exps = ["0d%", "0d25", "12D0", "1D0", "d0"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.diceExpMatcher(exps[i]);
      should(result).be.null();
    }
  });
});

describe("constantMatcher", function () {
  it("should accept whole numbers", function () {
    var exps = ["25 test", "111 test", "1 test"];
    var expectedResults = [25, 111, 1];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.constantMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      result.tokens[0].value.should.equal(expectedResults[i]);
      result.rest.should.equal(" test");
    }
  });
  it("should reject negative numbers, zero and whole numbers starting with zero", function () {
    var exps = ["-25", "-0", "0", "05"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.constantMatcher(exps[i]);
      should(result).be.null();
    }
  });
  it("should reject strings starting with non-numerical characters", function () {
    var exps = ["abcde", " d5", "%", "!25", "e12", ".5"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.constantMatcher(exps[i]);
      should(result).be.null();
    }
  });
});

describe("spaceMatcher", function () {
  it("should always succeed and return no token while consuming leading spaces", function () {
    var exps = ["", "  hey", " 25", "abcd", "abcd    ", " | "];
    var expectedRemainingStr = ["", "hey", "25", "abcd", "abcd    ", "| "];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.spaceMatcher(exps[i]);
      result.tokens.length.should.equal(0);
      result.rest.should.equal(expectedRemainingStr[i]);
    }
  });
});

describe("operatorMatcher", function () {
  it("should match + and -", function () {
    var exps = ["+ rest", "- rest"];
    var expectedResults = ["+", "-"];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.operatorMatcher(exps[i]);
      result.tokens.length.should.equal(1);
      result.tokens[0].should.equal(expectedResults[i]);
      result.rest.should.equal(" rest");
    }
  });
  it("should not match any string not starting with either + or -", function () {
    var exps = ["abcd", "1234", " +5", " -5", "*1", "5d5", "/12", "%", ""];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.operatorMatcher(exps[i]);
      should(result).be.null();
    }
  });
});

describe("orCombinator", function () {
  // creates matcher that always succeeds {tokens: [value], rest: ""}
  function mockMatcherCreator(value) {
    return function () {
      return {tokens: [value], rest: ""};
    };
  }

  function mockFailMatcher() {
    return null;
  }

  function mockErrorMatcher() {
    should.fail("", "", "This matcher should not have been run");
  }

  it("if matcher1 succeeds, should return its result and not run matcher2", function () {
    var matcher1 = mockMatcherCreator("test");
    var matcher2 = mockErrorMatcher;
    var result = parser.orCombinator(matcher1, matcher2)("1");
    result.tokens.length.should.equal(1);
    result.tokens[0].should.equal("test");
  });

  it("if matcher1 fails, should run matcher2 and return its results", function () {
    var matcher1 = mockFailMatcher;
    var matcher2 = mockMatcherCreator("no2");
    var result = parser.orCombinator(matcher1, matcher2)("1");
    result.tokens.length.should.equal(1);
    result.tokens[0].should.equal("no2");
  });
});

describe("parseDiceExpression", function () {
  it("should parse dice expressions correctly", function () {
    var exps = ["5D3", "2d% + 5", "10", "d10 - 2 + 5d2"];
    var expectedLength = [1, 2, 1, 3];
    var expectedType = [[Dice], [Dice, ConstantDie], [ConstantDie], [Dice, ConstantDie, Dice]];
    var expectedMin = [[5], [2, 5], [10], [1, -2, 5]];
    var expectedMax = [[15], [200, 5], [10], [10, -2, 10]];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.parseDiceExpression(exps[i]);
      result.length.should.equal(expectedLength[i]);
      for (var j = 0; j < result.length; j++) {
        (result[j] instanceof expectedType[i][j]).should.be.true();
        result[j].min().should.equal(expectedMin[i][j]);
        result[j].max().should.equal(expectedMax[i][j]);
      }
    }
  });
  it("should parse dice expressions with irregular spacing", function () {
    var exps = ["   2D5+5 ", "  3d%  -2", "62d5+ 2   "];
    var expectedLength = [2, 2, 2];
    var expectedType = [[Dice, ConstantDie], [Dice, ConstantDie], [Dice, ConstantDie]];
    var expectedMin = [[2, 5], [3, -2], [62, 2]];
    var expectedMax = [[10, 5], [300, -2], [310, 2]];
    for (var i = 0; i < exps.length; i++) {
      var result = parser.parseDiceExpression(exps[i]);
      result.length.should.equal(expectedLength[i]);
      for (var j = 0; j < result.length; j++) {
        (result[j] instanceof expectedType[i][j]).should.be.true();
        result[j].min().should.equal(expectedMin[i][j]);
        result[j].max().should.equal(expectedMax[i][j]);
      }
    }
  });
  it("should be able to parse very large strings", function () {
    var term = "10d10";
    var exp = term;
    for (var i = 0; i < 10000; i++) {
      exp += " + " + term;
    }
    var result = parser.parseDiceExpression(exp);
    result.length.should.equal(10001);
  });
  it("should throw an exception for invalid dice terms or constants", function () {
    var exps = ["3d5 + e5", "ab - d5", "0 + 25", "-52 + 2", "D% + %"];
    exps.forEach(function (exp) {
      should.throws(function () {
        parser.parseDiceExpression(exp);
      });
    });
  });
  it("should throw an exception when expressions start or end with operators", function () {
    var exps = ["- 5D3", "2d% + 5 -", "+ 10", "d10 - 2 + 5d2 -"];
    exps.forEach(function (exp) {
      should.throws(function () {
        parser.parseDiceExpression(exp);
      });
    });
  });
});
