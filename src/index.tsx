import * as React from "react";
import * as ReactDOM from "react-dom";

import * as easyStarters from "../puzzles/conceptis-easy-starters.json";
import { Puzzle, Solution } from "./types";
import { solveFrom, solveStep, addBridge } from "./solver";
import { Button, Dropdown, DropdownItemProps } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

interface PuzzleController {
  puzzle: Puzzle;
  solution: Solution;
  options: DropdownItemProps[];

  clickHandler: (index: number) => void;
  loadSolution: (solutionIndex: number) => void;
  solve: () => void;
  solveStep: () => void;
  reset: () => void;
}

function usePuzzleController(): PuzzleController {
  const [state, setState] = React.useState(() => {
    const puzzle = Puzzle.fromObject(easyStarters.puzzles[0]);
    const solution = new Solution([]);
    return {
      puzzle,
      solution,
    };
  });
  const { puzzle, solution } = state;
  const updateState = (up) =>
    setState((prevState) => ({ ...prevState, ...up }));

  function clickHandler(val: number) {
    console.log("!", val);
  }

  const options = easyStarters.puzzles.map((puzzle, index) => ({
    key: index,
    value: index,
    text: `${easyStarters.name} - ${index + 1}`,
  }));

  return {
    puzzle,
    solution,
    clickHandler,
    options,

    loadSolution(index: number) {
      setState({
        puzzle: Puzzle.fromObject(easyStarters.puzzles[index]),
        solution: new Solution([]),
      });
    },

    solve() {
      const newSolution = solveFrom(puzzle, solution);
      updateState({
        solution: newSolution,
      });
    },

    solveStep() {
      const [newSolution, result] = solveStep(puzzle, solution);
      updateState({
        solution: newSolution,
      });
    },

    reset() {
      updateState({
        solution: new Solution([]),
      });
    },
  };
}

function MyElem() {
  const controller = usePuzzleController();
  const { puzzle, solution, clickHandler, options } = controller;
  const onChangePuzzleDropdown = function (event, data) {
    controller.loadSolution(data.value);
  };
  return (
    <Container>
      <MySvg puzzle={puzzle} solution={solution} onClickNode={clickHandler} />
      <Panel>
        <h2>Select level</h2>
        <div>
          <Dropdown
            fluid
            search
            selection
            placeholder="bla"
            options={options}
            onChange={onChangePuzzleDropdown}
            defaultValue={0}
          />
        </div>
        <div>
          <Button onClick={controller.reset}>Reset</Button>
          <Button onClick={controller.solve}>Solve</Button>
          <Button onClick={controller.solveStep}>Solve step</Button>
        </div>
      </Panel>
    </Container>
  );
}

function Container({ children }) {
  const style = {
    display: "flex",
  };
  return <div style={style}>{children}</div>;
}

function Panel({ children }) {
  return <div>{children}</div>;
}

function MySvg({
  puzzle,
  solution,
  onClickNode,
}: {
  puzzle: Puzzle;
  solution: Solution;
  onClickNode: (islandIndex: number) => void;
}) {
  const scale = 60;
  const offset = scale / 2;
  const width = puzzle.width * scale;
  const height = puzzle.height * scale;
  const place = (x: number) => x * scale + offset;

  const dragPos = React.useRef<null | { x: number; y: number }>(null);
  const [dragOrigin, setDragOrigin] = React.useState<null | number>(null);
  const [dragVector, setDragVector] = React.useState<null | {
    x: number;
    y: number;
  }>(null);
  const handleIslandMouseDown = (event) => {
    const islandIndex = +event.currentTarget.dataset.index;
    dragPos.current = { x: event.pageX, y: event.pageY };
    setDragOrigin(islandIndex);
  };
  const handleMouseUp = (event) => {
    dragPos.current = null;
    setDragVector(null);
    setDragOrigin(null);
  };
  const handleMouseMove = (event) => {
    if (dragPos.current === null) {
      return;
    }
    const nx = event.pageX;
    const ny = event.pageY;
    const { x, y } = dragPos.current;
    const dx = nx - x;
    const dy = ny - y;
    if (dy == dx) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragVector({
        x: Math.sign(dx),
        y: 0,
      });
    } else {
      setDragVector({
        x: 0,
        y: Math.sign(dy),
      });
    }
  };

  if (dragOrigin && dragVector) {
    solution = solution.clone();
    addBridgeByVector(puzzle, solution, dragOrigin, dragVector);
  }

  const islandValues = puzzle.islands.map((x) => 0);
  for (let bridge of solution.bridges) {
    islandValues[bridge.from] += bridge.value;
    islandValues[bridge.to] += bridge.value;
  }
  const islandIsFull = (index) =>
    islandValues[index] == puzzle.islands[index].value;

  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        userSelect: "none",
      }}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {solution.bridges.map((bridge, index) => (
        <Bridge
          key={index}
          x1={place(puzzle.islands[bridge.from].x)}
          y1={place(puzzle.islands[bridge.from].y)}
          x2={place(puzzle.islands[bridge.to].x)}
          y2={place(puzzle.islands[bridge.to].y)}
          double={bridge.value == 2}
          emphasis={bridge.emphasis}
        />
      ))}
      {puzzle.islands.map((island, index) => (
        <Circle
          key={index}
          cx={place(island.x)}
          cy={place(island.y)}
          text={island.value + ""}
          onMouseDown={handleIslandMouseDown}
          index={index}
          full={islandIsFull(index)}
        />
      ))}
    </svg>
  );
}

function Bridge({ x1, x2, y1, y2, double = false, emphasis = 0 }) {
  const spread = 4;
  const offsetIndices = double ? [1, 2] : [0];
  const offsets =
    x1 == x2
      ? [
          { x: 0, y: 0 },
          { x: -spread, y: 0 },
          { x: spread, y: 0 },
        ]
      : [
          { x: 0, y: 0 },
          { x: 0, y: -spread },
          { x: 0, y: spread },
        ];
  const widths = [
    ["1.5", "1.5", "1.5"],
    ["3.5", "3.5", "1.5"],
    ["3.5", "3.5", "3.5"],
  ][emphasis];
  return (
    <g>
      {offsetIndices.map((i) => (
        <line
          key={i}
          x1={x1 + offsets[i].x}
          y1={y1 + offsets[i].y}
          x2={x2 + offsets[i].x}
          y2={y2 + offsets[i].y}
          strokeWidth={widths[i]}
          stroke="#000"
          fill="none"
        />
      ))}
    </g>
  );
}

function Circle({
  cx = 100,
  cy = 100,
  text = "1",
  className = "",
  index,
  full = false,
  onMouseDown,
}) {
  const mainColor = full ? "#ccc" : "#fff";
  const ld = (25 / 2) * 1.41;
  return (
    <g onMouseDown={onMouseDown} className={className} data-index={index}>
      <ellipse
        ry="25"
        rx="25"
        cy={cy}
        cx={cx}
        strokeWidth="1.5"
        stroke="#000"
        fill={mainColor}
      />
      <text
        xmlSpace="preserve"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="24"
        id="svg_2"
        x={cx}
        y={cy}
        strokeWidth="0"
        stroke="#000"
        fill="#000000"
      >
        {text}
      </text>
      {full && (
        <line
          x1={cx - ld}
          y1={cy + ld}
          x2={cx + ld}
          y2={cy - ld}
          strokeWidth="1.5"
          stroke="#000"
          fill="none"
        />
      )}
    </g>
  );
}

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<MyElem />, div);

function addBridgeByVector(
  puzzle: Puzzle,
  solution: Solution,
  dragOrigin: number,
  dragVector: { x: number; y: number }
) {
  const [matrix, err] = solution.toMatrix(puzzle);
  if (!matrix) {
    console.error("addBridgeByVector", err);
    return;
  }
  let { x, y } = puzzle.islands[dragOrigin];
  while (true) {
    x += dragVector.x;
    y += dragVector.y;
    if (x < 0 || x >= puzzle.width || y < 0 || y >= puzzle.height) {
      break;
    }
    if (matrix[x][y].bridge) {
      break;
    }
    const index = matrix[x][y].index;
    if (index !== null) {
      addBridge(solution, dragOrigin, index);
      break;
    }
  }
}
