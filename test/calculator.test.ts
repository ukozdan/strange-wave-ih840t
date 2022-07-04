const maths = require("../src/calculator");
//import mathOperations from "../src/calculator";

describe("Calculator tests", () => {
  test("adding 1 + 2 should return 10", () => {
    // arrange and act
    var result = maths.sum(1, 2);

    // assert
    expect(result).toBe(3);
  });
});
