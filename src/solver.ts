import { Puzzle, Island, Solution, SolutionField } from "./types";
import { SolutionContext, analyze } from "./analyzer";

// interface SolverContext {
//   puzzle: Puzzle;
//   solution: Solution;
//   currentBridges: number;
//   expectedBridges: number;
// }

export function solve(puzzle: Puzzle): Solution {
  let solution = new Solution([]);
  for (;;) {
    let [newSolution, successfulStep] = solveStep(puzzle, solution);
    if (!successfulStep) {
      return newSolution;
    }
    solution = newSolution;
  }
}

function solveStep(puzzle: Puzzle, solution: Solution): [Solution, boolean] {
  solution = solution.clone();
  const { metas } = analyze(puzzle, solution);
  // ...

  for (let meta of metas) {
    if (
      meta.neighbours.length == 2 &&
      meta.desiredValue == 3 &&
      meta.bridges.length < 2
    ) {
      ensureOneBridge(solution, meta.index, meta.neighbours[0]);
      ensureOneBridge(solution, meta.index, meta.neighbours[1]);
      return [solution, true];
    }

    if (meta.neighbours.length == 1 && meta.desiredValue != meta.currentValue) {
      addBridge(solution, meta.index, meta.neighbours[0]);
    }
  }
  return [solution, false];
}

function ensureOneBridge(solution: Solution, from: number, to: number) {
  // xxx
  const a = from > to ? to : from;
  const b = from > to ? from : to;

  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == a && bridge.to == b) {
      return;
    }
  }
  // not found - add
  solution.bridges.push({
    from: a,
    to: b,
    value: 1,
  });
}

function addBridge(solution, from: number, to: number) {
  const a = from > to ? to : from;
  const b = from > to ? from : to;
  solution.bridges.push({
    from: a,
    to: b,
    value: 1,
  });
}
