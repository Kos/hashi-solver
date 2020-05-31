import { solve } from "./solver";
import { Puzzle } from "./types";
import * as easy from "../puzzles/ConceptisEasy.json";
import * as medium from "../puzzles/ConceptisMedium.json";
// import * as mediumPlus from "../puzzles/ConceptisMediumPlus.json";
// import * as hard from "../puzzles/ConceptisEasy.json";

function checkCollection(collection, expectedCount) {
  const results = collection.puzzles.map((data, index) => {
    const puzzle = Puzzle.fromObject(data);
    const solution = solve(puzzle);
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
  it("should solve some easy puzzles", () => checkCollection(easy, 24));
  it("should solve some medium puzzles", () => checkCollection(medium, 0));
});
