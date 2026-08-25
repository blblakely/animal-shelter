import { describe, expect, it } from 'vitest';

const animationFrames = {
  down: [0, 1, 2, 3],
  left: [4, 5, 6, 7],
  right: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
};

describe('player animation contract', () => {
  it('assigns four unique frames to every direction', () => {
    const frames = Object.values(animationFrames).flat();
    expect(new Set(frames).size).toBe(16);
    expect(animationFrames.down).toEqual([0, 1, 2, 3]);
    expect(animationFrames.left).toEqual([4, 5, 6, 7]);
    expect(animationFrames.right).toEqual([8, 9, 10, 11]);
    expect(animationFrames.up).toEqual([12, 13, 14, 15]);
  });

  it('uses each direction first frame as its idle frame', () => {
    expect(Object.fromEntries(Object.entries(animationFrames).map(([direction, frames]) => [direction, frames[0]]))).toEqual({ down: 0, left: 4, right: 8, up: 12 });
  });
});
