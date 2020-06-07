import { Puzzle, Solution } from "./types";
import { SolutionContext, IslandMeta } from "./analyzer";
import * as editor from "./solutionEditor";

export interface TacticQuery {
  puzzle: Puzzle;
  solution: Solution;
  context: SolutionContext;
  index: number;
  meta: IslandMeta;
}

export interface Tactic {
  label: string;

  isApplicable(params: TacticQuery): boolean;

  apply(params: TacticQuery): boolean; // TODO rewrite existing tactics so that they don't depend on apply returning a boolean...
}

const id = (x) => x;

export const tactics: Tactic[] = [
  // --------------
  // Basic tactics
  // --------------
  {
    label: "An island with one remaining neighbour must connect to it.",

    isApplicable({ context, index }) {
      const meta = context.metas[index];
      return (
        meta.activeNeighbours.length === 1 &&
        meta.desiredValue != meta.currentValue
      );
    },

    apply({ solution, context, meta }) {
      if (
        context.metas[meta.activeNeighbours[0]].remainingValue <
        meta.remainingValue
      ) {
        throw new Error(
          `Contradiction: ${meta.index} - ${meta.activeNeighbours[0]}`
        );
      }
      for (let i = 0; i < meta.remainingValue; ++i) {
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

  // --------------
  // 4-based tricks
  // --------------

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
      "A '4' with three neighbours that has a neighbour that can only accept 1 bridge must have at least one bridge in two remaining directions.",

    isApplicable({ context, meta }) {
      if (meta.neighbours.length == 3 && meta.desiredValue == 4) {
        return true;
      }
      return false;
    },

    apply({ context, solution, meta }) {
      for (let i = 0; i < 3; ++i) {
        const n = context.metas[meta.neighbours[i]];
        if (
          n.desiredValue - n.currentValue == 1 &&
          n.bridges.some((b) => b.to == meta.index) === false
        ) {
          return [
            meta.neighbours[0] == n.index
              ? false
              : editor.ensureOneBridge(
                  solution,
                  meta.index,
                  meta.neighbours[0]
                ),
            meta.neighbours[1] == n.index
              ? false
              : editor.ensureOneBridge(
                  solution,
                  meta.index,
                  meta.neighbours[1]
                ),
            meta.neighbours[2] == n.index
              ? false
              : editor.ensureOneBridge(
                  solution,
                  meta.index,
                  meta.neighbours[2]
                ),
          ].some(id);
        }
      }
      return false;
    },
  },

  {
    label: "A '4' with three '2' neighbours needs at least one bridge to each.",

    isApplicable({ context, meta }) {
      if (
        meta.neighbours.length == 3 &&
        meta.desiredValue == 4 &&
        meta.neighbours.every((n) => context.metas[n].desiredValue == 2)
      ) {
        return true;
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
      "A '4' with two '2' neighbours needs at least one bridge to the other neighbour.",

    isApplicable({ context, meta }) {
      if (
        meta.neighbours.length == 3 &&
        meta.desiredValue == 4 &&
        meta.neighbours.filter((n) => context.metas[n].desiredValue == 2)
          .length == 2
      ) {
        return true;
      }
      return false;
    },

    apply({ solution, context, meta }) {
      return editor.ensureOneBridge(
        solution,
        meta.index,
        meta.neighbours.filter((x) => context.metas[x].desiredValue != 2)[0]
      );
    },
  },

  {
    label:
      "A node that has only one neighbour that is not a '1' must have at least one bridge to this neighbour.",

    isApplicable({ context, meta }) {
      return (
        meta.neighbours.filter((nx) => context.metas[nx].desiredValue === 1)
          .length ==
        meta.neighbours.length - 1
      );
    },

    apply({ solution, context, meta }) {
      for (let nx of meta.neighbours) {
        if (context.metas[nx].desiredValue != 1) {
          return editor.ensureOneBridge(solution, meta.index, nx);
        }
      }
      return false;
    },
  },

  {
    label:
      "An unconnected '3' with remaining neighbours must have at least one bridge to each.",

    isApplicable({ meta }) {
      return (
        meta.currentValue == 0 &&
        meta.activeNeighbours.length == 2 &&
        meta.desiredValue == 3
      );
    },

    apply({ solution, meta }) {
      return [
        editor.ensureOneBridge(solution, meta.index, meta.activeNeighbours[0]),
        editor.ensureOneBridge(solution, meta.index, meta.activeNeighbours[1]),
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
      return false;
    },
  },

  {
    label:
      "An island that has two open neighbours remaining and at least two bridges to assign, must assign one bridge to neighbour B if neighbour A could only accept one.",

    isApplicable({ meta }) {
      return (
        meta.activeNeighbours.length == 2 &&
        meta.desiredValue - meta.currentValue > 1
      );
    },

    apply({ meta, solution, context }) {
      const nbs = meta.activeNeighbours.map((id) => context.metas[id]);
      if (nbs[0].desiredValue - nbs[0].currentValue == 1) {
        editor.addBridge(solution, meta.index, nbs[1].index);
        return true;
      }
      if (nbs[1].desiredValue - nbs[1].currentValue == 1) {
        editor.addBridge(solution, meta.index, nbs[0].index);
        return true;
      }
      return false;
    },
  },

  // ----------------------
  // Dragon-based reasoning
  // ----------------------

  {
    label:
      "If a group of islands only has two active islands left and connecting them would make a dead-end, one bridge has to be added elsewhere.",

    isApplicable({ meta, context }) {
      return (
        context.dragons.length > 1 &&
        meta.activeNeighbours.length == 2 &&
        meta.remainingValue == 1 &&
        context.dragons[meta.dragonIndex].heads == 2 &&
        meta.activeNeighbours.some(
          (nx) =>
            context.metas[nx].dragonIndex == meta.dragonIndex &&
            context.metas[nx].remainingValue == 1
        )
      );
    },

    apply({ meta, context, solution }) {
      for (let nx of meta.activeNeighbours) {
        if (context.metas[nx].dragonIndex != meta.dragonIndex) {
          editor.addBridge(solution, meta.index, nx);
          return true;
        }
      }
      return false;
    },
  },

  {
    label:
      "If two groups of islands only have one active island left and connecting them would make a dead-end, one bridge has to be added elsewhere.",

    isApplicable({ meta, context }) {
      return (
        context.dragons.length > 1 &&
        meta.activeNeighbours.length == 2 &&
        meta.remainingValue == 1 &&
        context.dragons[meta.dragonIndex].heads == 1 &&
        meta.activeNeighbours.some(
          (nx) =>
            context.metas[nx].dragonIndex != meta.dragonIndex &&
            context.dragons[context.metas[nx].dragonIndex].heads == 1 &&
            context.metas[nx].remainingValue == 1
        )
      );
    },

    apply({ meta, context, solution }) {
      for (let nx of meta.activeNeighbours) {
        if (
          !(
            context.metas[nx].dragonIndex != meta.dragonIndex &&
            context.dragons[context.metas[nx].dragonIndex].heads == 1 &&
            context.metas[nx].remainingValue == 1
          )
        ) {
          editor.addBridge(solution, meta.index, nx);
          return true;
        }
      }
      return false;
    },
  },

  {
    label: "STUB",

    isApplicable({ meta }) {
      return false;
    },

    apply({ meta, solution, context }) {
      return false;
    },
  },
];
