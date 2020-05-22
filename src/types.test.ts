import { Puzzle, Solution } from "./types";
import { solve } from "./solver";
import * as easyStarters from "../puzzles/conceptis-easy-starters.json";

var puzzle: Puzzle = new Puzzle(17, 6, [
  { x: 2, y: 1, value: 2 },
  { x: 7, y: 1, value: 4 },
  { x: 12, y: 1, value: 3 },
  { x: 15, y: 2, value: 1 },
  { x: 12, y: 3, value: 2 },
  { x: 7, y: 4, value: 3 },
  { x: 15, y: 4, value: 3 },
]);

it("should render empty solution", () => {
  const solution = new Solution([]);
  expect(solution.isLegal(puzzle)).toBeTruthy();
  expect(solution.renderToString(puzzle)).toEqual(`\
·················
··2····4····3····
···············1·
············2····
·······3·······3·
·················
`);
});
it("should render a simple solution", () => {
  const solution = new Solution([
    {
      from: 0,
      to: 1,
      value: 1,
    },
    {
      from: 2,
      to: 4,
      value: 2,
    },
  ]);
  const [a, b] = solution.validate(puzzle);
  expect(b).toEqual("");
  expect(solution.isLegal(puzzle)).toBeTruthy();
  expect(solution.renderToString(puzzle)).toEqual(`\
·················
··2────4····3····
············║··1·
············2····
·······3·······3·
·················
`);
});

it("should solve a simple puzzle", () => {
  const solution = solve(puzzle);
  expect(solution.isLegal(puzzle)).toBeTruthy();
  expect(solution.renderToString(puzzle)).toEqual(`\
·················
··2════4────3····
·······│····║··1·
·······│····2··│·
·······3═══════3·
·················
`);
});

it("should load from example format", () => {
  const puzzle = Puzzle.fromObject(easyStarters.puzzles[0]);
  expect(puzzle.renderToString()).toEqual(`\
2·2··2·
······1
6·5·3··
·1····3
3·1··1·
·3··8·5
4·2····
·2··5·2
2··1···
··2·5·3
`);
});

it("should solve example", () => {
  const puzzle = Puzzle.fromObject(easyStarters.puzzles[0]);
  const solution = solve(puzzle);
  expect(solution.isLegal(puzzle)).toBeTruthy();
  console.log(solution.renderToString(puzzle));
  expect(solution.renderToString(puzzle)).toEqual(`\
2·2──2·
║·│··│1
6═5─3││
║1│·║│3
3│1·║1║
│3══8═5
4═2·║·│
│2══5·2
2──1│·│
··2═5═3
`);
});
