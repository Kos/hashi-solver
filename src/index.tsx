import * as React from "react";
import * as ReactDOM from "react-dom";

import * as easyStarters from "../puzzles/conceptis-easy-starters.json";
import { Puzzle, Solution } from "./types";
import { solve } from "./solver";

function MyElem() {
  const puzzle = Puzzle.fromObject(easyStarters.puzzles[0]);
  const solution = solve(puzzle);

  function clickHandler(val: number) {
    console.log("!", val);
  }

  return (
    <div>
      <MySvg puzzle={puzzle} solution={solution} onClickNode={clickHandler} />
    </div>
  );
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
  const handleClick = React.useCallback(
    (event) => {
      onClickNode(+event.currentTarget.dataset.index);
    },
    ["onClickNode"]
  );

  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        userSelect: "none",
      }}
    >
      {solution.bridges.map((bridge, index) => (
        <Bridge
          key={index}
          x1={place(puzzle.islands[bridge.from].x)}
          y1={place(puzzle.islands[bridge.from].y)}
          x2={place(puzzle.islands[bridge.to].x)}
          y2={place(puzzle.islands[bridge.to].y)}
          double={bridge.value == 2}
        />
      ))}
      {puzzle.islands.map((island, index) => (
        <Circle
          key={index}
          cx={place(island.x)}
          cy={place(island.y)}
          text={island.value + ""}
          onClick={handleClick}
          index={index}
        />
      ))}
    </svg>
  );
}

function Bridge({ x1, x2, y1, y2, double = false }) {
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
  return (
    <g>
      {offsetIndices.map((i) => (
        <line
          key={i}
          x1={x1 + offsets[i].x}
          y1={y1 + offsets[i].y}
          x2={x2 + offsets[i].x}
          y2={y2 + offsets[i].y}
          strokeWidth="1.5"
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
  onClick,
  index,
}) {
  return (
    <g onClick={onClick} className={className} data-index={index}>
      <ellipse
        ry="25"
        rx="25"
        cy={cy}
        cx={cx}
        strokeWidth="1.5"
        stroke="#000"
        fill="#fff"
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
    </g>
  );
}

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<MyElem />, div);
