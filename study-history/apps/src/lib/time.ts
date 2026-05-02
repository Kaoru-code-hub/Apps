const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function startOfTodayJST(now: number = Date.now()): number {
  const jstNow = now + JST_OFFSET_MS;
  const dayStartJst = Math.floor(jstNow / 86_400_000) * 86_400_000;
  return dayStartJst - JST_OFFSET_MS;
}

export function startOfWeekJST(now: number = Date.now()): number {
  const todayStart = startOfTodayJST(now);
  const jstDay = new Date(todayStart + JST_OFFSET_MS).getUTCDay();
  const daysSinceMonday = (jstDay + 6) % 7;
  return todayStart - daysSinceMonday * 86_400_000;
}

export function formatHM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  return `${h}h ${m}m`;
}

export function formatHMSDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatDateTimeJST(epochMs: number): string {
  const d = new Date(epochMs + JST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${y}/${mo}/${da} ${hh}:${mm}`;
}

export function formatDateJST(epochMs: number): string {
  const d = new Date(epochMs + JST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}/${mo}/${da}`;
}
