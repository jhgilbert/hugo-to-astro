import { qaMigratedFile, detectPhrases } from "../../src/qa";
import { describe, test, expect } from "vitest";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("QA functions", () => {
  test("detectPhrases", () => {
    const text = "Hello! {{< beep >}} {{% boop %}} This is a test :).";

    const actualResult = detectPhrases(text);

    console.log("Actual Result:", actualResult);

    const expectedResult = {
      Hello: 1,
      beep: 1,
      boop: 1,
      "This is a test": 1,
      is: 2,
    };

    expect(actualResult).toEqual(expectedResult);
  });

  /*
  describe("qaMigratedFile", async () => {
    test("detects perfect match", async () => {
      const inFile = `${__dirname}/reference/in.md`;
      const outFile = `${__dirname}/reference/validOut.mdoc`;

      const result = qaMigratedFile({
        mdFilePath: inFile,
        mdocFilePath: outFile,
      });

      await expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
        `${__dirname}/__snapshots__/matchResult.json`
      );

      // expect(result.match).toBe(true);
      expect(true).toBe(true); // Placeholder for actual test
    });

    test("detects mismatch", async () => {
      const inFile = `${__dirname}/reference/in.md`;
      const outFile = `${__dirname}/reference/invalidOut.mdoc`;

      const result = qaMigratedFile({
        mdFilePath: inFile,
        mdocFilePath: outFile,
      });

      await expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
        `${__dirname}/__snapshots__/mismatchResult.json`
      );

      // expect(result.match).toBe(false);
      expect(true).toBe(true); // Placeholder for actual test
    });
  });
  */
});
