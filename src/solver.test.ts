import { solve } from "./solver";
import { Puzzle } from "./types";
import * as easy from "../puzzles/ConceptisEasy.json";
import * as medium from "../puzzles/ConceptisMedium.json";
import * as medPlus from "../puzzles/ConceptisMediumPlus.json";
import * as hard from "../puzzles/ConceptisHard.json";

function checkCollection(collection, expectedCount) {
  const results = collection.puzzles.map((data, index) => {
    const puzzle = Puzzle.fromObject(data);
    try {
      var solution = solve(puzzle);
    } catch (e) {
      throw new Error(
        `Failed at puzzle ${collection.name} - ${index + 1}: ${e}`
      );
    }
    return solution.isCorrect(puzzle);
  });
  console.log(
    results
      .map(
        (value, index) =>
          `${collection.name}: puzzle ${index + 1}: ${value ? "👍" : "❌"}`
      )
      .join("\n")
  );
  expect(results.reduce((a, b) => a + b, 0)).toEqual(expectedCount);
}

describe("solver", () => {
  it("should solve some easy puzzles", () => checkCollection(easy, 50));
  it("should solve some medium puzzles", () => checkCollection(medium, 44));
  it("should solve some medium+ puzzles", () => checkCollection(medPlus, 26));
  it("should solve some hard puzzles", () => checkCollection(hard, 1));
});
