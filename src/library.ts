import * as easyPuzzles from "../puzzles/ConceptisEasy.json";
import * as mediumPuzzles from "../puzzles/ConceptisMedium.json";
import * as mediumPlusPuzzles from "../puzzles/ConceptisMediumPlus.json";
import { Puzzle, PuzzleObject } from "./types";

function load(collection: { name: string; puzzles: PuzzleObject[] }) {
  return collection.puzzles.map((puzzle, index) => ({
    label: `${collection.name} - ${index + 1}`,
    puzzle: Puzzle.fromObject(puzzle),
  }));
}

export const library = [
  ...load(easyPuzzles),
  ...load(mediumPuzzles),
  ...load(mediumPlusPuzzles),
];
