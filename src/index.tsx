import * as React from "react";
import * as ReactDOM from "react-dom";

import { Puzzle, Solution, SolutionFieldBridge } from "./types";
import { solveStep } from "./solver";
import { library } from "./library";
import { toggleBridge, addHighlight } from "./solutionEditor";
import { Button, Dropdown, DropdownItemProps, List } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

interface PuzzleController {
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

function usePuzzleController(): PuzzleController {
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

function MyElem() {
  const controller = usePuzzleController();
  const {
    puzzle,
    solution,
    solutionStack,
    redoStack,
    options,
    toggleBridge,
  } = controller;
  const onChangePuzzleDropdown = function (event, data) {
    controller.loadSolution(data.value);
  };
  return (
    <Container>
      <MySvg
        puzzle={puzzle}
        solution={solution}
        onToggleBridge={toggleBridge}
      />
      <Panel>
        <h2>Select puzzle</h2>
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
        <p>
          Puzzles courtesy of{" "}
          <a
            href="https://www.conceptispuzzles.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Conceptis Puzzles
          </a>
          .
        </p>
        <div>
          <Button onClick={controller.reset}>Reset</Button>
          <Button onClick={controller.undo}>Undo</Button>
          <Button onClick={controller.redo}>Redo</Button>
          <Button onClick={controller.solve}>Solve</Button>
          <Button onClick={controller.solveStep}>Solve step</Button>
        </div>
        <List divided relaxed>
          {solutionStack.map((x, n) => (
            <List.Item key={n}>
              <List.Icon
                name={
                  n == 0
                    ? "star outline"
                    : x.manual
                    ? "arrow right"
                    : "lightbulb outline"
                }
                size="large"
                verticalAlign="middle"
              />
              <List.Content>
                <List.Description>{x.comment}</List.Description>
              </List.Content>
            </List.Item>
          ))}
          {redoStack.map((x, n) => (
            <List.Item key={n} style={{ opacity: 0.5 }}>
              <List.Icon
                name={x.manual ? "arrow right" : "lightbulb outline"}
                size="large"
                verticalAlign="middle"
              />
              <List.Content>
                <List.Description>{x.comment}</List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
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
  onToggleBridge,
}: {
  puzzle: Puzzle;
  solution: Solution;
  onToggleBridge: (from: number, to: number) => void;
}) {
  const scale = 60;
  const offset = scale / 2;
  const width = puzzle.width * scale;
  const height = puzzle.height * scale;
  const place = (x: number) => x * scale + offset;

  const dragOriginPositionRef = React.useRef<null | { x: number; y: number }>(
    null
  );
  const dragOriginIndexRef = React.useRef<null | number>(null);
  const [highlightedBridge, setHighlightedBridge] = React.useState<null | {
    from: number;
    to: number;
  }>(null);

  const handleIslandMouseDown = (event) => {
    const islandIndex = +event.currentTarget.dataset.index;
    const rect = event.currentTarget.getBoundingClientRect();
    dragOriginPositionRef.current = {
      x: (rect.right + rect.left) / 2,
      y: (rect.bottom + rect.top) / 2,
    };
    dragOriginIndexRef.current = islandIndex;
  };
  const handleMouseUp = (event) => {
    if (highlightedBridge !== null) {
      const { from, to } = highlightedBridge;
      onToggleBridge(from, to);
    }
    dragOriginPositionRef.current = null;
    dragOriginIndexRef.current = null;
    setHighlightedBridge(null);
  };
  const handleMouseMove = (event) => {
    if (
      dragOriginPositionRef.current === null ||
      dragOriginIndexRef.current === null
    ) {
      return;
    }
    const nx = event.pageX;
    const ny = event.pageY;
    const { x, y } = dragOriginPositionRef.current;
    const dx = nx - x;
    const dy = ny - y;
    if (dy == dx) return;
    let dragVector: { x: number; y: number };
    if (Math.abs(dx) > Math.abs(dy)) {
      dragVector = {
        x: Math.sign(dx),
        y: 0,
      };
    } else {
      dragVector = {
        x: 0,
        y: Math.sign(dy),
      };
    }

    const target = getDragDropTarget(
      puzzle,
      solution,
      dragOriginIndexRef.current,
      dragVector
    );
    if (target !== null) {
      setHighlightedBridge({ from: dragOriginIndexRef.current, to: target });
    } else {
      setHighlightedBridge(null);
    }
  };

  if (highlightedBridge) {
    solution = solution.clone();
    addHighlight(solution, highlightedBridge.from, highlightedBridge.to);
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
          emphasis={bridge.emphasis || 0}
          highlight={bridge.highlight || false}
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

function Bridge({
  x1,
  x2,
  y1,
  y2,
  double = false,
  emphasis = 0,
  highlight = true,
}) {
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
      {highlight && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          strokeWidth={20}
          stroke="hotpink"
        />
      )}
      {!highlight &&
        offsetIndices.map((i) => (
          <line
            key={i}
            x1={x1 + offsets[i].x}
            y1={y1 + offsets[i].y}
            x2={x2 + offsets[i].x}
            y2={y2 + offsets[i].y}
            strokeWidth={widths[i]}
            stroke="#000"
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

function getDragDropTarget(
  puzzle: Puzzle,
  solution: Solution,
  dragOrigin: number,
  dragVector: { x: number; y: number }
): number | null {
  const [matrix, err] = solution.toMatrix(puzzle);
  if (!matrix) {
    console.error("getDragDropTarget", err);
    return null;
  }
  let { x, y } = puzzle.islands[dragOrigin];
  while (true) {
    x += dragVector.x;
    y += dragVector.y;
    if (x < 0 || x >= puzzle.width || y < 0 || y >= puzzle.height) {
      return null;
    }
    if (matrix[x][y].bridge) {
      const { bridge } = matrix[x][y];
      if (
        dragVector.x !== 0 &&
        (bridge == SolutionFieldBridge.SingleVertical ||
          bridge == SolutionFieldBridge.DoubleVertical)
      ) {
        return null;
      }
      if (
        dragVector.y !== 0 &&
        (bridge == SolutionFieldBridge.SingleHorizontal ||
          bridge == SolutionFieldBridge.DoubleHorizontal)
      ) {
        return null;
      }
    }
    const index = matrix[x][y].index;
    if (index !== null) {
      return index;
    }
  }
}
