'use strict';

var should = require("should");
var DiceExpression = require("../lib");

describe("DiceExpression", function () {
  it("constructor should throw an exception for invalid inputs", function () {
    var exps = ["1 + d5 -", "-5", "abcd efgh", "5 5 5", "0d6 + 2", "d6 +"];
    exps.forEach(function (exp) {
      should.throws(function () {
        exp = new DiceExpression(exp);
      });
    });
  });
  it("when used as a function, should roll and return the final value", function () {
    var exps = ["d%", "5 + d5 + 25", "2d6", "3d6 + 7"];
    var min = [1, 31, 2, 10];
    var max = [100, 35, 12, 25];
    for (var i = 0; i < exps.length; i++) {
      var dice = new DiceExpression(exps[i]);
      for (var j = 0; j < 1000; j++) {
        var roll = dice();
        roll.should.be.belowOrEqual(max[i]);
        roll.should.be.aboveOrEqual(min[i]);
      }
    }
  });
  describe("min", function () {
    it("should return the minimum roll for the given dice expresion", function () {
      var exps = ["5 + 3d%", "20D5 - 15", "20D5 - 2 - 2 - 2 - 2"];
      var expectedMin = [8, 5, 12];
      for (var i = 0; i < exps.length; i++) {
        var dice = new DiceExpression(exps[i]);
        dice.min().should.equal(expectedMin[i]);
      }
    });
  });
  describe("max", function () {
    it("should return the maximum roll for the given dice expresion", function () {
      var exps = ["5d5 + 2d%", "15 - 2d5 + 2 - 1", "2000D100 + 1 + 1 + 1 - 2"];
      var expectedMax = [225, 14, 200001];
      for (var i = 0; i < exps.length; i++) {
        var dice = new DiceExpression(exps[i]);
        dice.max().should.equal(expectedMax[i]);
      }
    });
  });
  describe("roll", function () {
    function sum(arr) {
      var result = 0;
      for (var i = 0; i < arr.length; i++) {
        result += arr[i];
      }
      return result;
    }
    // simulating a bunch of rolls and ensuring that all component dice rolls and each level of
    // aggregation fall within limit and numbers add up correctly from components to the final sum
    it("should return the final roll value and its components and subcomponents", function () {
      var exps = ["2d10 + 2d5", "2d3 + 15", "5D200 + 2"];
      var min = [4, 17, 7];
      var max = [30, 21, 1002];
      var componentMin = [[2, 2], [2, 15], [5, 2]];
      var componentMax = [[20, 10], [6, 15], [1000, 2]];
      var subComponentMin = [[[1, 1], [1, 1]], [[1, 1], [15]], [[1, 1, 1, 1, 1], [2]]];
      var subComponentMax = [[[10, 10], [5, 5]], [[3, 3], [15]], [[200, 200, 200, 200, 200], [2]]];
      for (var i = 0; i < exps.length; i++) {
        var dice = new DiceExpression(exps[i]);
        for (var j = 0; j < 10; j++) {
          var roll = dice.roll();
          var rollValue = roll.roll;
          var components = roll.diceSums;
          var subComponents = roll.diceRaw;
          rollValue.should.be.belowOrEqual(max[i]);
          rollValue.should.be.aboveOrEqual(min[i]);
          for (var k = 0; k < components.length; k++) {
            components[k].should.be.belowOrEqual(componentMax[i][k]);
            components[k].should.be.aboveOrEqual(componentMin[i][k]);
            for (var l = 0; l < subComponents[k].length; l++) {
              subComponents[k][l].should.be.belowOrEqual(subComponentMax[i][k][l]);
              subComponents[k][l].should.be.aboveOrEqual(subComponentMin[i][k][l]);
            }
            components[k].should.be.equal(sum(subComponents[k]));
          }
          rollValue.should.be.equal(sum(components));
        }
      }
    });
  });
});
