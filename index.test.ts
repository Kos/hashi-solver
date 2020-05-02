import { Puzzle } from "./index";

var puzzle: Puzzle = new Puzzle(17, 6, [
  { x: 2, y: 1, value: 2 },
  { x: 7, y: 1, value: 4 },
  { x: 12, y: 1, value: 3 },
  { x: 15, y: 2, value: 1 },
  { x: 12, y: 3, value: 2 },
  { x: 7, y: 4, value: 3 },
  { x: 15, y: 4, value: 3 },
]);

it("should win", () => {
  expect(puzzle.toString()).toEqual(`\
·················
··2····4····3····
···············1·
············2····
·······3·······3·
·················
`);
});
