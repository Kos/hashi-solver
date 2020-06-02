import * as React from "react";

import { Puzzle, Solution } from "./types";
import { solveStep } from "./solver";
import { library } from "./library";
import { toggleBridge } from "./solutionEditor";
import { DropdownItemProps } from "semantic-ui-react";

export interface PuzzleController {
  puzzle: Puzzle;
  solutionStack: { solution: Solution; comment: string; manual?: boolean }[];
  redoStack: { solution: Solution; comment: string; manual?: boolean }[];
  solution: Solution;
  options: DropdownItemProps[];

  loadSolution: (solutionIndex: number) => void;
  solve: () => void;
  solveStep: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  toggleBridge: (from: number, to: number) => void;
}

export function usePuzzleController(): PuzzleController {
  const [state, setState] = React.useState(() => {
    const puzzle = library[0].puzzle;
    const solutionStack = [
      { solution: new Solution([]), comment: "The beginning" },
    ];
    return {
      puzzle,
      solutionStack,
      redoStack: [],
    };
  });
  const { puzzle, solutionStack, redoStack } = state;
  const solution = solutionStack[solutionStack.length - 1].solution;

  const updateState = (up) =>
    setState((prevState) => ({ ...prevState, ...up }));

  const options = library.map((entry, index) => ({
    key: index,
    value: index,
    text: entry.label,
  }));

  return {
    puzzle,
    solution,
    solutionStack,
    redoStack,
    options,

    loadSolution(index: number) {
      setState({
        puzzle: Puzzle.fromObject(library[index].puzzle),
        solutionStack: [
          { solution: new Solution([]), comment: "The beginning" },
        ],
        redoStack: [],
      });
    },

    solve() {
      const newStack = solutionStack.slice();
      let currentSolution = solution;
      for (;;) {
        let result = solveStep(puzzle, currentSolution);
        if (!result) {
          break;
        }
        currentSolution = result.solution;
        newStack.push({
          solution: currentSolution,
          comment: result.tactic?.label || "",
        });
      }
      updateState({
        solutionStack: [...newStack],
        redoStack: [],
      });
    },

    solveStep() {
      console.log("solveStep");
      const result = solveStep(puzzle, solution);
      if (!result) {
        return;
      }
      updateState({
        solutionStack: [
          ...solutionStack,
          { solution: result.solution, comment: result.tactic?.label },
        ],
        redoStack: [],
      });
    },

    undo() {
      if (solutionStack.length <= 1) {
        return;
      }
      updateState({
        solutionStack: solutionStack.slice(0, solutionStack.length - 1),
        redoStack: [solutionStack[solutionStack.length - 1], ...redoStack],
      });
    },

    redo() {
      if (redoStack.length == 0) {
        return;
      }
      updateState({
        solutionStack: [...solutionStack, redoStack[0]],
        redoStack: redoStack.slice(1),
      });
    },

    reset() {
      updateState({
        solutionStack: [solutionStack[0]],
        redoStack: [],
      });
    },

    toggleBridge(from, to) {
      const newSolution = solution.clone();
      toggleBridge(newSolution, from, to);
      updateState({
        solutionStack: [
          ...solutionStack,
          { solution: newSolution, comment: "Manual step", manual: true },
        ],
        redoStack: [],
      });
    },
  };
}