/* A puzzle consists of:
- dimensions
- islands with positiosn 
*/
export interface Island {
  x: number;
  y: number;
  value: number;
}

interface PuzzleField {
  value: number | null;
  index: number | null;
}

interface PuzzleObject {
  // JSON notation for easy input
  width: number;
  height: number;
  data: string;
}

export class Puzzle {
  constructor(
    public width: number,
    public height: number,
    public islands: Island[]
  ) {}

  static fromObject(obj: PuzzleObject): Puzzle {
    const islands: Island[] = [];
    let { width, height, data } = obj;
    data = data.replace(/ /g, "");
    for (let i = 0; i < data.length; ++i) {
      const value = +data[i];
      if (isNaN(+value)) continue;
      islands.push({
        x: i % width,
        y: (i / width) | 0,
        value,
      });
    }
    return new Puzzle(width, height, islands);
  }

  asMatrix(): PuzzleField[][] {
    var columns: PuzzleField[][] = [];
    for (let x = 0; x < this.width; ++x) {
      var column: PuzzleField[] = [];
      columns.push(column);
      for (let y = 0; y < this.height; ++y) {
        column.push({ value: null, index: null });
      }
    }
    this.islands.forEach((island, index) => {
      const { x, y, value } = island;
      columns[x][y] = { value, index };
    });
    return columns;
  }

  renderToString(): string {
    return new Solution([]).renderToString(this);
  }
}

interface Bridge {
  readonly from: number;
  readonly to: number; // > from
  readonly value: number; // 1 or 2
}

export enum SolutionFieldBridge {
  SingleHorizontal = "─",
  DoubleHorizontal = "═",
  SingleVertical = "│",
  DoubleVertical = "║",
}

export interface SolutionField {
  value: number | null;
  bridge: SolutionFieldBridge | null;
  index: number | null;
}

export class Solution {
  /* A puzzle can have a solution. A solution might be correct or not. A solution might be legal or not. An empty solution is a legal solution too. 
    Solutions are represented by lists 3-tuples (index, index, value). Bridge indices must be sorted.
  */

  constructor(public bridges: Bridge[]) {}

  clone() {
    return new Solution(this.bridges.slice());
  }

  isLegal(p: Puzzle): boolean {
    return this.validate(p)[0];
  }

  validate(p: Puzzle): [boolean, string] {
    /* A solution is legal if:
    - all bridges connect two distinct islands
    - all bridges are normalized
    - all bridge values are 1 or 2
    - all bridges are horizontal or vertical
    - there are no duplicate bridges
    - there are no crossing bridges
    */
    for (let bridge of this.bridges) {
      if (!p.islands[bridge.from] || !p.islands[bridge.to])
        return [false, "no such island"]; // no such island
      if (bridge.to)
        if (bridge.to <= bridge.from) return [false, "not normalized"]; // not normalized
      if (bridge.value != 1 && bridge.value != 2)
        return [false, "invalid island value"]; // invalid value

      let same_x = p.islands[bridge.from].x == p.islands[bridge.to].x;
      let same_y = p.islands[bridge.from].y == p.islands[bridge.to].y;
      if (same_x === same_y) return [false, "not horizontal/vertical"]; // not horizontal or vertical

      const [_, err] = this.toMatrix(p); // no crossings or duplicates (not representable as matrix)
      if (err) {
        return [false, err];
      }
    }
    return [true, ""];
  }

  toMatrix(p: Puzzle): [SolutionField[][] | null, string] {
    const matrix: SolutionField[][] = p
      .asMatrix()
      .map((column) =>
        column.map(({ value, index }) => ({ value, index, bridge: null }))
      );

    for (let bridge of this.bridges) {
      let dx: number, dy: number, symbol: SolutionFieldBridge;
      let horizontal = p.islands[bridge.from].y == p.islands[bridge.to].y;
      let vertical = p.islands[bridge.from].x == p.islands[bridge.to].x;
      if (horizontal && vertical) {
        return [null, "bridge is diagonal: " + bridge];
      }
      if (!horizontal && !vertical) {
        return [null, "bridge is strange: " + bridge];
      }
      if (vertical) {
        dx = 0;
        dy = 1;
        symbol = [
          SolutionFieldBridge.SingleVertical,
          SolutionFieldBridge.DoubleVertical,
        ][bridge.value - 1];
      } else {
        dx = 1;
        dy = 0;
        symbol = [
          SolutionFieldBridge.SingleHorizontal,
          SolutionFieldBridge.DoubleHorizontal,
        ][bridge.value - 1];
      }
      let cursor = {
        x: p.islands[bridge.from].x + dx,
        y: p.islands[bridge.from].y + dy,
      };
      let dest = {
        x: p.islands[bridge.to].x,
        y: p.islands[bridge.to].y,
      };
      while (cursor.x != dest.x || cursor.y != dest.y) {
        if (matrix[cursor.x][cursor.y].value) {
          return [null, `Bridges crossing at x=${cursor.x} y=${cursor.y}`];
        }
        matrix[cursor.x][cursor.y] = {
          value: null,
          bridge: symbol,
          index: null,
        };
        cursor.x += dx;
        cursor.y += dy;
      }
    }
    return [matrix, ""];
  }

  renderToString(p: Puzzle): string {
    const [matrix, err] = this.toMatrix(p);
    if (!matrix) {
      return "invalid solution: " + err;
    }
    let s = "";
    for (var y = 0; y < p.height; ++y) {
      for (var x = 0; x < p.width; ++x) {
        let val = matrix[x][y];
        if (val.bridge) {
          s += val.bridge;
        } else if (val.value) {
          s += val.value;
        } else {
          s += "·";
        }
      }
      s += "\n";
    }
    return s;
  }

  // isCorrect(p: Puzzle) {} // TODO
}

// console.log("isLegal", solution.isLegal(puzzle));
// console.log(solution.toString(puzzle));
