import { Puzzle, Solution } from "./types";
import { analyze } from "./analyzer";
import { tactics, TacticQuery, Tactic } from "./tactics";

export function solve(puzzle: Puzzle): Solution {
  let solution = new Solution([]);
  return solveFrom(puzzle, solution);
}

export function solveFrom(puzzle: Puzzle, solution: Solution) {
  for (;;) {
    let result = solveStep(puzzle, solution);
    if (!result) {
      return solution;
    }
    solution = result.solution;
  }
}

interface StepResult {
  solution: Solution;
  tactic?: Tactic;
}

export function solveStep(
  puzzle: Puzzle,
  solution: Solution
): StepResult | null {
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
          return { solution, tactic };
        }
      }
    }
  }
  // console.log("Not able to solve further", context);
  return null;
}
