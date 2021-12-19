import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import getInitialState from "./getInitialState";

export type TIsland = {
  x: number;
  y: number;
  value: number;
};

export type TPuzzleBlueprint = {
  name: string;
  width: number;
  height: number;
  islands: TIsland[];
};

export type TBridge = {
  from: number;
  to: number;
  value: 1 | 2;
  emphasis?: number; // 0 or 1 or 2, to mark most recent move for display
  highlight?: boolean; // true or false, to mark where next move would happen
};

export type TSolution = {
  bridges: TBridge[];
};

export type TSolvingStepComment = {};

export type TPuzzleSolvingStep = {
  // we could move highlight here?
  solution: TSolution;
  comment: TSolvingStepComment;
};

export type TPuzzleSolvingState = {
  puzzle: TPuzzleBlueprint;
  history: TPuzzleSolvingStep[];
};

export type TCategory = {
  name: string;
  puzzles: TPuzzleSolvingState[];
};

export type TPuzzles = {
  categories: TCategory[];
};

export const puzzleSlice = createSlice({
  name: "puzzles",
  initialState: getInitialState(),
  reducers: {},
});

export const {} = puzzleSlice.actions;

export const selectPuzzleCount = (state: RootState) =>
  state.puzzles.categories.reduce(
    (previousValue, cat) => previousValue + cat.puzzles.length,
    0
  );

export const selectPuzzleCategories = (state: RootState) =>
  state.puzzles.categories;

export default puzzleSlice.reducer;
