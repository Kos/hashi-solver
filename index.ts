/* A puzzle consists of:
- dimensions
- islands with positiosn 
*/
interface Island {
  x: number;
  y: number;
  value: number;
}

export class Puzzle {
  constructor(
    public width: number,
    public height: number,
    public islands: Island[]
  ) {}

  asMatrix() {
    var columns = [];
    for (let x = 0; x < this.width; ++x) {
      var column = [];
      columns.push(column);
      for (let y = 0; y < this.height; ++y) {
        column.push(null);
      }
    }
    for (let { x, y, value } of this.islands) {
      columns[x][y] = value;
    }
    return columns;
  }

  toString() {
    let s = "";
    var columns = this.asMatrix();
    for (var y = 0; y < this.height; ++y) {
      for (var x = 0; x < this.width; ++x) {
        let val = columns[x][y];
        if (val) {
          s += val;
        } else {
          s += "·";
        }
      }
      s += "\n";
    }
    return s;
  }
}

/*
   01234567890123456
 0
 1   2====4----3
 2        |    || 1
 3        |    2  |
 4        3=======3
 5
*/

/* A puzzle can be represented as a matrix. */

// console.log(puzzle.asMatrix());

/* A puzzle can be rendered */

// console.log(puzzle.toString());

/* A puzzle can have a solution. A solution might be correct or not. A solution might be legal or not. An empty solution is a legal solution too. 
Solutions are represented by lists 3-tuples (index, index, value). Bridge indices should be sorted.
*/

interface Bridge {
  from: number;
  to: number;
  value: number;
}

class Solution {
  constructor(public bridges: Bridge[]) {}

  isLegal(p: Puzzle) {
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

      // TODO duplicate
      try {
        this.toString(p);
      } catch {
        return [false, ""];
      }
      return [true, null];
    }
  }

  toString(p: Puzzle) {
    const matrix = p.asMatrix();
    for (let bridge of this.bridges) {
      let dx: number, dy: number, symbol: string;
      if (p.islands[bridge.from].x == p.islands[bridge.to].x) {
        dx = 0;
        dy = 1;
        symbol = "│║"[bridge.value - 1];
      } else {
        dx = 1;
        dy = 0;
        symbol = "─═"[bridge.value - 1];
      }
      let cursor = {
        x: p.islands[bridge.from].x + dx,
        y: p.islands[bridge.from].y + dy,
      };
      let dest = {
        x: p.islands[bridge.to].x,
        y: p.islands[bridge.to].y,
      };
      while (!(cursor.x == dest.x && cursor.y == dest.y)) {
        if (matrix[cursor.x][cursor.y] !== null) {
          throw new Error(`Stuff crossing at x=${cursor.x} y=${cursor.y}`);
        }
        matrix[cursor.x][cursor.y] = symbol;
        cursor.x += dx;
        cursor.y += dy;
      }
    }
    // TODO dedupe with the other toString
    let s = "";
    for (var y = 0; y < p.height; ++y) {
      for (var x = 0; x < p.width; ++x) {
        let val = matrix[x][y];
        if (val === null) {
          s += "·";
        } else {
          s += val;
        }
      }
      s += "\n";
    }
    return s;
  }

  // isCorrect(p: Puzzle) {}
}

var solution = new Solution([
  { from: 1, to: 2, value: 1 },
  { from: 0, to: 1, value: 1 },
  { from: 2, to: 3, value: 2 },
]);
// console.log("isLegal", solution.isLegal(puzzle));
// console.log(solution.toString(puzzle));
