'use strict';

require('should');
var diceTypes = require("../lib/dice-types.js");
var Dice = diceTypes.Dice;
var ConstantDie = diceTypes.ConstantDie;

describe("Dice", function () {
  describe("min", function () {
    it("should return the minimum possible roll for dice with positive rolls", function () {
      var d1 = new Dice(2, 6);
      d1.min().should.equal(2);
      var d2 = new Dice(1, 5);
      d2.min().should.equal(1);
      var d3 = new Dice(1000, 5000);
      d3.min().should.equal(1000);
    });
    it("should return the minimum possible roll for dice with negative rolls", function () {
      var d1 = new Dice(5, 1000);
      d1.setMinus();
      d1.min().should.equal(-5000);
      var d2 = new Dice(5, 8);
      d2.setMinus();
      d2.min().should.equal(-40);
    });
  });
  describe("max", function () {
    it("should return the maximum possible roll for dice with positive rolls", function () {
      var d1 = new Dice(2, 8);
      d1.max().should.equal(16);
      var d2 = new Dice(4, 25);
      d2.max().should.equal(100);
      var d3 = new Dice(1000, 3333);
      d3.max().should.equal(3333000);
    });
    it("should return the maximum possible roll for dice with negative rolls", function () {
      var d1 = new Dice(7, 8);
      d1.setMinus();
      d1.max().should.equal(-7);
      var d2 = new Dice(5, 24);
      d2.setMinus();
      d2.max().should.equal(-5);
      var d3 = new Dice(1025, 3333);
      d3.setMinus();
      d3.max().should.equal(-1025);
    });
  });
  describe("roll", function () {
    it("should return rolls within the correct range in the correct format", function () {
      var d1 = new Dice(8, 2);
      var diceRoll;
      var counts = [0, 0, 0];
      for (var i = 0; i < 100; i++) {
        diceRoll = d1.roll();
        diceRoll.roll.should.be.belowOrEqual(16);
        diceRoll.roll.should.be.aboveOrEqual(8);
        diceRoll.dice.length.should.equal(8);
        for (var j = 0; j < 8; j++) {
          diceRoll.dice[j].should.be.belowOrEqual(2);
          diceRoll.dice[j].should.be.aboveOrEqual(1);
          counts[diceRoll.dice[j]]++;
        }
      }
      // 1 and 2 are only possible individual roll values and for this many iterations, it's
      // probabilistically impossible for either number not to appear a few times.
      counts[1].should.be.aboveOrEqual(100);
      counts[2].should.be.aboveOrEqual(100);
    });
    it("should return rolls correctly for dice with negative rolls", function () {
      var d1 = new Dice(5, 4);
      d1.setMinus();
    });
  });
});

describe("ConstantDie", function () {
  describe("min", function () {
    it("should return the constant value", function () {
      var d1 = new ConstantDie(5);
      d1.min().should.equal(5);
    });
  });
  describe("max", function () {
    it("should return the constant value", function () {
      var d1 = new ConstantDie(5000);
      d1.max().should.equal(5000);
    });
  });
  describe("roll", function () {
    it("should return the constant value in the format of [ ", function () {
      var d1 = new ConstantDie(7777);
      var dieRoll = d1.roll();
      dieRoll.roll.should.equal(7777);
      dieRoll.dice[0].should.equal(7777);
      dieRoll.dice.length.should.equal(1);
    });
  });
  describe("setMinus", function () {
    it("should change the return values of min, max and roll to negative values", function () {
      var d1 = new ConstantDie(55);
      d1.setMinus();
      d1.min().should.equal(-55);
      d1.max().should.equal(-55);
      d1.roll().roll.should.equal(-55);
      d1.roll().dice[0].should.equal(-55);
      d1.setMinus(); // should have no impact
      d1.min().should.equal(-55);
      d1.max().should.equal(-55);
      d1.roll().roll.should.equal(-55);
      d1.roll().dice[0].should.equal(-55);
    });
  });
});

