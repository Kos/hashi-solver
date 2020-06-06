/*
Analyzer is responsible for reading a specific Solution (perhaps a partial one) and collecting different data about it
that will be used as the input of the Solver.
*/

import { Puzzle, Solution, SolutionField, SolutionFieldBridge } from "./types";

export interface IslandMeta {
  index: number; // index in Puzzle
  currentValue: number; // current total value of bridges
  desiredValue: number; // desired total value of bridges
  remainingValue: number; // desiredValue - currentValue
  neighbours: number[]; // indices of islands reachable using a bridge, without crossing but disregarding for island values
  activeNeighbours: number[]; // indices of islands we could legally add a bridge (regarding neighbour values and two bridges rule)
  bridges: { to: number; value: number }[]; // indices of islands we are currently connected to, and values of such bridges
  dragonIndex: number;
}

export interface DragonMeta {
  heads: number;
  size: number;
}

export interface SolutionContext {
  metas: IslandMeta[];
  dragons: DragonMeta[];
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
    remainingValue: island.value,
    neighbours: [],
    activeNeighbours: [],
    bridges: [],
    dragonIndex: -1,
  }));

  saveBridges(solution, metas);
  const neighbours = determineNeighbours(puzzle, matrix);
  saveActiveNeighbours(neighbours, metas);
  const dragons = calculateDragons(metas);
  return {
    metas,
    dragons,
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
    let lastSeenIslandIndex: number | null = null;
    for (var x = 0; x < p.width; ++x) {
      let current: SolutionField = matrix[x][y];
      if (
        current.bridge == SolutionFieldBridge.SingleVertical ||
        current.bridge == SolutionFieldBridge.DoubleVertical
      ) {
        lastSeenIslandIndex = null;
      } else if (current.index !== null) {
        if (lastSeenIslandIndex !== null) {
          neighbourPairs.push([lastSeenIslandIndex, current.index]);
        }
        lastSeenIslandIndex = current.index;
      }
    }
  }

  for (var x = 0; x < p.width; ++x) {
    let lastSeenIslandIndex: number | null = null;
    for (var y = 0; y < p.height; ++y) {
      let current: SolutionField = matrix[x][y];
      if (
        current.bridge == SolutionFieldBridge.SingleHorizontal ||
        current.bridge == SolutionFieldBridge.DoubleHorizontal
      ) {
        lastSeenIslandIndex = null;
      } else if (current.index !== null) {
        if (lastSeenIslandIndex !== null) {
          neighbourPairs.push([lastSeenIslandIndex, current.index]);
        }
        lastSeenIslandIndex = current.index;
      }
    }
  }

  return neighbourPairs;
}

function saveActiveNeighbours(
  neighbourPairs: NeighbourPair[],
  metas: IslandMeta[]
) {
  neighbourPairs.forEach(([a, b]) => {
    metas[a].neighbours.push(b);
    metas[b].neighbours.push(a);

    if (
      !metas[a].bridges.some((bridge) => bridge.to == b && bridge.value == 2)
    ) {
      if (metas[b].currentValue < metas[b].desiredValue) {
        metas[a].activeNeighbours.push(b);
      }
      if (metas[a].currentValue < metas[a].desiredValue) {
        metas[b].activeNeighbours.push(a);
      }
    }
  });
}

function saveBridges(solution: Solution, metas: IslandMeta[]) {
  solution.bridges.forEach((bridge) => {
    metas[bridge.from].bridges.push({ to: bridge.to, value: bridge.value });
    metas[bridge.from].currentValue += bridge.value;
    metas[bridge.from].remainingValue -= bridge.value;
    metas[bridge.to].bridges.push({ to: bridge.from, value: bridge.value });
    metas[bridge.to].currentValue += bridge.value;
    metas[bridge.to].remainingValue -= bridge.value;
  });
}

function calculateDragons(metas: IslandMeta[]): DragonMeta[] {
  /*
  Update meta.dragonIndex for each island.
  Return calculated array of dragons.
  (A "dragon" means a connected component, I tip my hat if you know why.)
  */
  let dragons: DragonMeta[] = [];
  for (let startIndex = 0; startIndex < metas.length; ++startIndex) {
    if (metas[startIndex].dragonIndex != -1) continue;
    const currentDragonIndex = dragons.length;
    const currentDragon = {
      heads: 0,
      size: 0,
    };
    dragons.push(currentDragon);

    const stack = [startIndex];
    while (stack.length) {
      const currentIndex = stack.pop() as number;
      // update island meta
      metas[currentIndex].dragonIndex = currentDragonIndex;

      // update dragon meta
      currentDragon.size += 1;
      if (
        metas[currentIndex].currentValue != metas[currentIndex].desiredValue
      ) {
        currentDragon.heads += 1;
      }

      // DFS onwards
      for (let bridge of metas[currentIndex].bridges) {
        if (metas[bridge.to].dragonIndex == -1) {
          stack.push(bridge.to);
        }
      }
    }
  }
  return dragons;
}
