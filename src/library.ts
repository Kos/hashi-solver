import * as easyPuzzles from "../puzzles/ConceptisEasy.json";
import * as mediumPuzzles from "../puzzles/ConceptisMedium.json";
import * as mediumPlusPuzzles from "../puzzles/ConceptisMediumPlus.json";
import * as hardPuzzles from "../puzzles/ConceptisMediumPlus.json";
import * as veryHardPuzzles from "../puzzles/ConceptisVeryHard.json";
import { Puzzle, PuzzleObject } from "./types";

function load(collection: { name: string; puzzles: PuzzleObject[] }) {
  return collection.puzzles.map((puzzle, index) => ({
    label: `${collection.name} - ${index + 1}`,
    puzzle: Puzzle.fromObject(puzzle),
  }));
}

export const library = [
  {
    label: "bla",
    puzzle: Puzzle.fromObject({
      data: `
      2.4.3.1.2..1.
      .........3..1
      ....2.3.2....
      2.3..2...3.1.
      ....2.5.3.4..
      1.5..2.1...2.
      ......2.2.4.2
      ..4.4..3...3.
      .............
      2.2.3...3.2.3
      .....2.4.4.3.
      ..1.2........
      3....3.1.2..2
      `,
      width: 13,
      height: 13,
    }),
  },
  ...load(easyPuzzles),
  ...load(mediumPuzzles),
  ...load(mediumPlusPuzzles),
  ...load(hardPuzzles),
  ...load(veryHardPuzzles),
];
