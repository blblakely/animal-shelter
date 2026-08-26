import { describe, expect, it } from 'vitest';
import { GAME_TIME_CONFIG } from '../src/config/gameTimeConfig.js';
import { formatGameTime, GameTimeSystem, resolveDevelopmentTimeScale } from '../src/systems/GameTimeSystem.js';

describe('game time', () => {
  it('advances at the configured development scale', () => {
    const clock = new GameTimeSystem(GAME_TIME_CONFIG, 480);
    expect(clock.update(1000)).toBe(1);
    expect(clock.totalMinutes).toBe(481);
    clock.setTimeScale(2);
    expect(clock.update(1000)).toBe(2);
  });

  it('does not advance while paused', () => {
    const clock = new GameTimeSystem(GAME_TIME_CONFIG, 480);
    clock.setPaused(true);
    expect(clock.update(5000)).toBe(0);
    expect(clock.totalMinutes).toBe(480);
  });

  it('formats days and twelve-hour time', () => {
    expect(formatGameTime(480)).toBe('Day 1 · 8:00 AM');
    expect(formatGameTime(1440 + 13 * 60 + 5)).toBe('Day 2 · 1:05 PM');
  });

  it('accepts a non-negative URL time scale for development testing', () => {
    expect(resolveDevelopmentTimeScale('?timeScale=0.1', 1)).toBe(0.1);
    expect(resolveDevelopmentTimeScale('?timeScale=4', 1)).toBe(4);
    expect(resolveDevelopmentTimeScale('?timeScale=invalid', 1)).toBe(1);
    expect(resolveDevelopmentTimeScale('?timeScale=-2', 1)).toBe(1);
  });
});
