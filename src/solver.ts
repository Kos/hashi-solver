import { Puzzle, Solution } from "./types";
import { analyze } from "./analyzer";

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

export function solveStep(
  puzzle: Puzzle,
  solution: Solution
): [Solution, boolean] {
  solution = solution.clone();
  const { metas } = analyze(puzzle, solution);

  for (let meta of metas) {
    if (
      meta.activeNeighbours.length == 1 &&
      meta.desiredValue != meta.currentValue
    ) {
      for (let i = 0; i < meta.desiredValue - meta.currentValue; ++i) {
        addBridge(solution, meta.index, meta.activeNeighbours[0]);
      }
      return [solution, true];
    }

    if (meta.neighbours.length == 2 && meta.desiredValue == 3) {
      const added = [
        ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        ensureOneBridge(solution, meta.index, meta.neighbours[1]),
      ].some((x) => x);
      if (added) {
        return [solution, true];
      }
    }

    if (meta.neighbours.length == 3 && meta.desiredValue == 5) {
      const added = [
        ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        ensureOneBridge(solution, meta.index, meta.neighbours[1]),
        ensureOneBridge(solution, meta.index, meta.neighbours[2]),
      ].some((x) => x);
      if (added) {
        return [solution, true];
      }
    }

    if (meta.neighbours.length == 3 && meta.desiredValue == 6) {
      const added = [
        ensureTwoBridges(solution, meta.index, meta.neighbours[0]),
        ensureTwoBridges(solution, meta.index, meta.neighbours[1]),
        ensureTwoBridges(solution, meta.index, meta.neighbours[2]),
      ].some((x) => x);
      if (added) {
        return [solution, true];
      }
    }

    if (meta.desiredValue == 7) {
      const added = [
        ensureOneBridge(solution, meta.index, meta.neighbours[0]),
        ensureOneBridge(solution, meta.index, meta.neighbours[1]),
        ensureOneBridge(solution, meta.index, meta.neighbours[2]),
        ensureOneBridge(solution, meta.index, meta.neighbours[3]),
      ].some((x) => x);
      if (added) {
        return [solution, true];
      }
    }

    if (meta.desiredValue == 8) {
      const added = [
        ensureTwoBridges(solution, meta.index, meta.neighbours[0]),
        ensureTwoBridges(solution, meta.index, meta.neighbours[1]),
        ensureTwoBridges(solution, meta.index, meta.neighbours[2]),
        ensureTwoBridges(solution, meta.index, meta.neighbours[3]),
      ].some((x) => x);
      if (added) {
        return [solution, true];
      }
    }
  }
  return [solution, false];
}

function ensureOneBridge(
  solution: Solution,
  from: number,
  to: number
): boolean {
  [from, to] = max2(from, to);

  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      return false;
    }
  }
  // not found - add
  solution.bridges.push({
    from,
    to,
    value: 1,
    emphasis: 1,
  });
  return true;
}

function ensureTwoBridges(
  solution: Solution,
  from: number,
  to: number
): boolean {
  [from, to] = max2(from, to);
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      if (bridge.value == 1) {
        solution.bridges[i] = {
          from,
          to,
          value: 2,
          emphasis: 1,
        };
        return true;
      }
      if (bridge.value == 2) {
        return false;
      }
    }
  }
  solution.bridges.push({
    from,
    to,
    value: 2,
    emphasis: 2,
  });
  return true;
}

export function addBridge(solution: Solution, from: number, to: number) {
  [from, to] = max2(from, to);
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      if (bridge.value == 1) {
        solution.bridges[i] = {
          from,
          to,
          value: 2,
          emphasis: 1,
        };
        return;
      }
      if (bridge.value == 2) {
        throw new Error("Tried to add a third bridge");
      }
    }
  }
  solution.bridges.push({
    from,
    to,
    value: 1,
    emphasis: 1,
  });
}

function max2(a, b) {
  return a < b ? [a, b] : [b, a];
}
