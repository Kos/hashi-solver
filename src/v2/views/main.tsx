import * as React from "react";
import CategoryList from "../components/CategoryList";
import { selectPuzzleCount } from "../features/puzzles/puzzleSlice";
import { useAppSelector } from "../hooks";

type TProps = {};

export default function Main(props: TProps) {
  const puzzlesCount = useAppSelector(selectPuzzleCount);
  return (
    <div>
      <p>Main screen turn on</p>
      <p>Puzzles count: {puzzlesCount}</p>
      <CategoryList />
    </div>
  );
}
