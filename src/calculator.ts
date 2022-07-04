interface something {
  a: number;
  b: number;
}

const mathOperations = {
  sum: function (a: number, b: number) {
    return a + b;
  },

  diff: function (a: number, b: number) {
    return a - b;
  },
  product: function (a: number, b: number) {
    return a * b;
  }
};
module.exports = mathOperations;
