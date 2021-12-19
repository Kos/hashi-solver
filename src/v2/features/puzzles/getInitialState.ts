import * as easyPuzzles from "../../../../puzzles/ConceptisEasy.json";
import * as mediumPuzzles from "../../../../puzzles/ConceptisMedium.json";
import * as mediumPlusPuzzles from "../../../../puzzles/ConceptisMediumPlus.json";
import * as hardPuzzles from "../../../../puzzles/ConceptisMediumPlus.json";
import * as veryHardPuzzles from "../../../../puzzles/ConceptisVeryHard.json";
import { TCategory, TPuzzles } from "./puzzleSlice";
import { PuzzleObject } from "../../../types";

function loadCategory(collection: {
  name: string;
  puzzles: PuzzleObject[];
}): TCategory {
  return {
    name: collection.name,
    puzzles: collection.puzzles.map((x, index) => ({
      puzzle: {
        name: puzzleName(collection.name, index),
        width: x.width,
        height: x.height,
        islands: x.islands || [],
      },
      history: [],
    })),
  };
}

function puzzleName(categoryName: string, index: number): string {
  return `${categoryName} - ${index + 1}`;
}

export default function getInitialState(): TPuzzles {
  return {
    categories: [
      loadCategory(easyPuzzles),
      loadCategory(mediumPuzzles),
      loadCategory(mediumPlusPuzzles),
      loadCategory(hardPuzzles),
      loadCategory(veryHardPuzzles),
    ],
  };
}
