import { Code } from "../src/code";

//const initialFile = require("../InitialFile');

test("initialFile check", () => {
  let code = new Code("TEST MESSAGE");
  expect(code.getMessage()).toBe("TEST MESSAGE");
});
