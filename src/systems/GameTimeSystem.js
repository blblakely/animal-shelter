const MINUTES_PER_DAY = 24 * 60;

export function formatGameTime(totalMinutes) {
  const wholeMinutes = Math.floor(totalMinutes);
  const day = Math.floor(wholeMinutes / MINUTES_PER_DAY) + 1;
  const minuteOfDay = ((wholeMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `Day ${day} · ${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function resolveDevelopmentTimeScale(search, fallback = 1) {
  const rawValue = new URLSearchParams(search).get('timeScale');
  if (rawValue === null) return fallback;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export class GameTimeSystem {
  constructor(config, initialTotalMinutes) {
    this.config = config;
    this.totalMinutes = initialTotalMinutes ?? (
      (config.startingDay - 1) * MINUTES_PER_DAY
      + config.startingHour * 60
      + config.startingMinute
    );
    this.timeScale = config.developmentTimeScale;
    this.paused = false;
  }

  update(realDeltaMs) {
    if (this.paused) return 0;
    const elapsedGameMinutes = (realDeltaMs / 1000) * this.config.gameMinutesPerRealSecond * this.timeScale;
    this.totalMinutes += elapsedGameMinutes;
    return elapsedGameMinutes;
  }

  setPaused(paused) { this.paused = paused; }
  setTimeScale(scale) { this.timeScale = Math.max(0, scale); }
  getDisplayTime() { return formatGameTime(this.totalMinutes); }
}
