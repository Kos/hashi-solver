import { Puzzle, Solution } from "./types";
import { analyze, SolutionContext, IslandMeta } from "./analyzer";
import * as editor from "./solutionEditor";

export function solve(puzzle: Puzzle): Solution {
  let solution = new Solution([]);
  return solveFrom(puzzle, solution);
}

export function solveFrom(puzzle: Puzzle, solution: Solution) {
  for (;;) {
    let [newSolution, successfulStep] = solveStep(puzzle, solution);
    if (!successfulStep) {
      return newSolution;
    }
    solution = newSolution;
  }
}

interface TacticQuery {
  puzzle: Puzzle;
  solution: Solution;
  context: SolutionContext;
  index: number;
  meta: IslandMeta;
}

interface Tactic {
  label: string;

  isApplicable(params: TacticQuery): boolean;

  apply(params: TacticQuery): boolean; // TODO rewrite existing tactics so that they don't depend on apply returning a boolean...
}

const id = (x) => x;

const tactics: Tactic[] = [
  // --------------
  // Basic tactics
  // --------------
  {
    label: "Add remaining bridges for a node with one active neighbour",

    isApplicable({ context, index }) {
      const meta = context.metas[index];
      return (
        meta.activeNeighbours.length === 1 &&
        meta.desiredValue != meta.currentValue
      );
    },

    apply({ solution, meta }) {
      for (let i = 0; i < meta.desiredValue - meta.currentValue; ++i) {
        editor.addBridge(solution, meta.index, meta.activeNeighbours[0]);
      }
      return true;
    },
  },

  {
    label: "A '3' with two neighbours must have at least one bridge to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 2 && meta.desiredValue == 3;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[1]),
      ].some(id);
    },
  },

  {
    label: "A '5' with three neighbours must have at least one bridge to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 3 && meta.desiredValue == 5;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[1]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[2]),
      ].some(id);
    },
  },

  {
    label: "A '6' with three neighbours must have two bridges to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 3 && meta.desiredValue == 6;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[0]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[1]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[2]),
      ].some(id);
    },
  },

  {
    label: "A '7' with four neighbours must have at least one bridge to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 4 && meta.desiredValue == 7;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[1]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[2]),
        editor.ensureOneBridge(solution, meta.index, meta.neighbours[3]),
      ].some(id);
    },
  },

  {
    label: "An '8' with four neighbours must have two bridges to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 4 && meta.desiredValue == 8;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[0]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[1]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[2]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[3]),
      ].some(id);
    },
  },

  {
    label: "STUB",

    isApplicable({ meta }) {
      return false;
    },

    apply() {
      return false;
    },
  },
];

export function solveStep(
  puzzle: Puzzle,
  solution: Solution
): [Solution, boolean] {
  solution = solution.clone();
  const context = analyze(puzzle, solution);
  const { metas } = context;

  for (let tactic of tactics) {
    for (let index = 0; index < puzzle.islands.length; ++index) {
      const query: TacticQuery = {
        context,
        puzzle,
        solution,
        index,
        meta: metas[index],
      };
      if (tactic.isApplicable(query)) {
        if (tactic.apply(query)) {
          return [solution, true];
        }
      }
    }
  }
  return [solution, false];
}
