import { Puzzle, Island, Solution, SolutionField } from "./types";

interface IslandContext {
  value: number;
  index: number;
  neighbours: number[];
}

interface SolverContext {
  puzzle: Puzzle;
  solution: Solution;
  currentBridges: number;
  expectedBridges: number;
}

export function solve(puzzle: Puzzle): Solution {
  const ctx = {
    puzzle,
    solution: new Solution([]),
    currentBridges: 0,
    expectedBridges: countExpectedBridges(puzzle),
  };
  solveStep(ctx);
  solveStep(ctx);
  return ctx.solution;
}

function solveStep(ctx: SolverContext) {
  const [matrix, err] = ctx.solution.toMatrix(ctx.puzzle);
  if (matrix === null) {
    throw new Error("solve: got weird solution: " + err);
  }

  const contexts = ctx.puzzle.islands.map((island, index) => ({
    value: island.value,
    index,
    neighbours: [],
  }));

  const neighbours = determineNeighbours(ctx.puzzle, matrix);
  saveNeighbours(neighbours, contexts);
  console.log(neighbours);

  function ensureOneBridge(from: number, to: number) {
    // xxx
    const a = from > to ? to : from;
    const b = from > to ? from : to;

    for (let i = 0; i < ctx.solution.bridges.length; ++i) {
      const bridge = ctx.solution.bridges[i];
      if (bridge.from == a && bridge.to == b) {
        return;
      }
    }
    // not found - add
    ctx.solution.bridges.push({
      from: a,
      to: b,
      value: 1,
    });
  }

  for (let context of contexts) {
    if (context.neighbours.length == 2 && context.value == 3) {
      ensureOneBridge(context.index, context.neighbours[0]);
      ensureOneBridge(context.index, context.neighbours[1]);
      break;
    }
  }
}

type NeighbourPair = [number, number];

function determineNeighbours(
  p: Puzzle,
  matrix: SolutionField[][]
): NeighbourPair[] {
  /* given a matrix, for each island in the matrix, collect its neighbours */
  const neighbourPairs: NeighbourPair[] = [];

  for (var y = 0; y < p.height; ++y) {
    let prev: number | null = null;
    for (var x = 0; x < p.width; ++x) {
      let current = matrix[x][y].index;
      if (current !== null) {
        if (prev !== null) {
          neighbourPairs.push([prev, current]);
        }
        prev = current;
      }
    }
  }

  for (var x = 0; x < p.width; ++x) {
    let prev: number | null = null;
    for (var y = 0; y < p.height; ++y) {
      let current = matrix[x][y].index;
      if (current !== null) {
        if (prev !== null) {
          neighbourPairs.push([prev, current]);
        }
        prev = current;
      }
    }
  }
  return neighbourPairs;
}

function saveNeighbours(
  neighbourPairs: NeighbourPair[],
  contexts: IslandContext[]
) {
  contexts.forEach((x) => (x.neighbours = []));
  neighbourPairs.forEach(([a, b]) => {
    contexts[a].neighbours.push(b);
    contexts[b].neighbours.push(a);
  });
}

function countExpectedBridges(p: Puzzle) {
  return 4; // xxx
}
