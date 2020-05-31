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
    label: "A '4' with two neighbours must have two bridges to each.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 2 && meta.desiredValue == 4;
    },

    apply({ solution, meta }) {
      return [
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[0]),
        editor.ensureTwoBridges(solution, meta.index, meta.neighbours[1]),
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
    label:
      "A '4' with three neighbours that has exactly one bridge in a direction must have at least one bridge in two remaining directions.",

    isApplicable({ context, meta }) {
      if (meta.neighbours.length == 3 && meta.desiredValue == 4) {
        for (let i = 0; i < meta.bridges.length; ++i) {
          if (meta.bridges[i].value == 1) {
            const neighbourMeta = context.metas[meta.bridges[i].to];
            if (neighbourMeta.currentValue == neighbourMeta.desiredValue) {
              return true;
            }
          }
        }
      }
      return false;
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
    label:
      "A '3' that has three neighbours, where two of them are '1' and '2', should have at least one bridge to the third one.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 3 && meta.desiredValue == 3;
    },

    apply({ context, meta, solution }) {
      const nonOneIndices: number[] = [];
      for (let i = 0; i < meta.neighbours.length; ++i) {
        const nbIndex = meta.neighbours[i];
        if (context.metas[nbIndex].desiredValue != 1) {
          nonOneIndices.push(nbIndex);
        }
      }
      if (nonOneIndices.length != 2) {
        return false;
      }
      return [
        context.metas[nonOneIndices[0]].desiredValue == 2 &&
          editor.ensureOneBridge(solution, meta.index, nonOneIndices[1]),
        context.metas[nonOneIndices[1]].desiredValue == 2 &&
          editor.ensureOneBridge(solution, meta.index, nonOneIndices[0]),
      ].some(id);
    },
  },

  {
    label:
      "A '2' that has a neighbour '1' or '2' needs one bridge to another neighbour.",

    isApplicable({ meta }) {
      return meta.neighbours.length == 2 && meta.desiredValue == 2;
    },

    apply({ meta, solution, context }) {
      if (context.metas[meta.neighbours[0]].desiredValue <= 2) {
        return editor.ensureOneBridge(solution, meta.index, meta.neighbours[1]);
      }
      if (context.metas[meta.neighbours[1]].desiredValue <= 2) {
        return editor.ensureOneBridge(solution, meta.index, meta.neighbours[0]);
      }
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
