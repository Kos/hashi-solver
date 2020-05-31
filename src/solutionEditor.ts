import { Solution } from "./types";

export function ensureOneBridge(
  solution: Solution,
  from: number,
  to: number
): boolean {
  [from, to] = max2(from, to);
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      return false;
    }
  }
  // not found - add
  solution.bridges.push({
    from,
    to,
    value: 1,
    emphasis: 1,
  });
  return true;
}

export function ensureTwoBridges(
  solution: Solution,
  from: number,
  to: number
): boolean {
  [from, to] = max2(from, to);
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      if (bridge.value == 1) {
        solution.bridges[i] = {
          from,
          to,
          value: 2,
          emphasis: 1,
        };
        return true;
      }
      if (bridge.value == 2) {
        return false;
      }
    }
  }
  solution.bridges.push({
    from,
    to,
    value: 2,
    emphasis: 2,
  });
  return true;
}

export function addBridge(solution: Solution, from: number, to: number) {
  [from, to] = max2(from, to);
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      if (bridge.value == 1) {
        solution.bridges[i] = {
          from,
          to,
          value: 2,
          emphasis: 1,
        };
        return;
      }
      if (bridge.value == 2) {
        throw new Error("Tried to add a third bridge");
      }
    }
  }
  solution.bridges.push({
    from,
    to,
    value: 1,
    emphasis: 1,
  });
}

export function addHighlight(solution: Solution, from: number, to: number) {
  [from, to] = max2(from, to);
  solution.bridges.unshift({
    from,
    to,
    value: 0,
    highlight: true,
  });
}

export function toggleBridge(solution: Solution, from: number, to: number) {
  [from, to] = max2(from, to);
  // TODO analyze, prevent adding bridges over limit.. Or we could stash that in isLegal instead
  for (let i = 0; i < solution.bridges.length; ++i) {
    const bridge = solution.bridges[i];
    if (bridge.from == from && bridge.to == to) {
      if (bridge.value == 1) {
        solution.bridges[i] = {
          from,
          to,
          value: 2,
          emphasis: 1,
        };
        return;
      }
      if (bridge.value == 2) {
        solution.bridges.splice(i, 1);
        return;
      }
    }
  }
  solution.bridges.push({
    from,
    to,
    value: 1,
    emphasis: 1,
  });
}

export function max2(a, b) {
  return a < b ? [a, b] : [b, a];
}
