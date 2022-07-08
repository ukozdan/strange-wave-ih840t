import CertStat from "../src/index";
import { v4 as uuidv4 } from "uuid";

describe("CertStat", () => {
  test("should be defined", () => {
    // arrange and act
    var result = CertStat;

    // assert
    expect(result).toBeDefined();
  });
});
