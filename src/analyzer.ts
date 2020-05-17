/*
Analyzer is responsible for reading a specific Solution (perhaps a partial one) and collecting different data about it
that will be used as the input of the Solver.
*/

import { Puzzle, Island, Solution, SolutionField } from "./types";

interface IslandMeta {
  index: number; // index in Puzzle
  currentValue: number; // same as bridges.length
  desiredValue: number; // desired nubmer of islands
  neighbours: number[]; // indices of islands we could be connected to.
  bridges: number[]; // indices of islands we're connected to. Double bridge = 1 entry, so that bridges.length <= currentValue.
}

export interface SolutionContext {
  metas: IslandMeta[];
}

export function analyze(puzzle: Puzzle, solution: Solution): SolutionContext {
  const [matrix, err] = solution.toMatrix(puzzle);
  if (matrix === null) {
    throw new Error("solve: got weird solution: " + err);
  }

  const metas: IslandMeta[] = puzzle.islands.map((island, index) => ({
    index,
    currentValue: 0,
    desiredValue: island.value,
    neighbours: [],
    bridges: [],
  }));

  const neighbours = determineNeighbours(puzzle, matrix);
  saveNeighbours(neighbours, metas);
  // TODO maybe islands A, B should not be considered 'neighbours' if B is fully occupied and a bridge can no longer be placed?
  // Do we ever need to consider these? I doubt it...
  saveBridges(solution, metas);
  console.log(neighbours);
  return {
    metas,
  };
}

type NeighbourPair = [number, number];

function determineNeighbours(
  p: Puzzle,
  matrix: SolutionField[][]
): NeighbourPair[] {
  /*
  Given a matrix, for each island in the matrix, collect its neighbours.
  If there's a bridge between two islands, they are not currently considered neighbours.
  So for one puzzle, given different intermediate steps, we would see different neighbour maps.
  */
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

function saveNeighbours(neighbourPairs: NeighbourPair[], metas: IslandMeta[]) {
  neighbourPairs.forEach(([a, b]) => {
    metas[a].neighbours.push(b);
    metas[b].neighbours.push(a);
  });
}

function saveBridges(solution: Solution, metas: IslandMeta[]) {
  solution.bridges.forEach((bridge) => {
    metas[bridge.from].bridges.push(bridge.to);
    metas[bridge.from].currentValue += bridge.value;
    metas[bridge.to].bridges.push(bridge.from);
    metas[bridge.to].currentValue += bridge.value;
  });
}
