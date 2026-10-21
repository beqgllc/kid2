export function estimateSyllables(value: string): number {
  const words = value.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  return words.reduce((sum, word) => {
    if (word.length <= 3) return sum + 1;
    const groups = word.replace(/(?:[^laeiouy]e)$/, '').match(/[aeiouy]+/g)?.length ?? 1;
    return sum + Math.max(1, groups);
  }, 0);
}

export function analyzeBars(text: string, target = 12) {
  const lines = text.split(/\r?\n/);
  const rows = lines.filter((line) => line.trim() && !/^\s*\[[^\]]+\]\s*$/.test(line)).map((line) => ({
    text: line,
    syllables: estimateSyllables(line),
    words: (line.match(/[\p{L}\p{N}']+/gu) ?? []).length,
  }));
  return { rows, bars: rows.length, words: rows.reduce((total, row) => total + row.words, 0), target, outOfRange: rows.filter((row) => Math.abs(row.syllables - target) > 2).length };
}

export function formatLyrics(text: string, normalizeHeadings: boolean) {
  const headings: Record<string, string> = { verse: 'Verse', hook: 'Chorus', chorus: 'Chorus', bridge: 'Bridge', intro: 'Intro', outro: 'Outro', prechorus: 'Pre-Chorus', 'pre-chorus': 'Pre-Chorus' };
  const lines = text.replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd());
  const output: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed && (!output.length || output.at(-1) === '')) continue;
    const match = trimmed.match(/^\[\s*(verse|hook|chorus|bridge|intro|outro|pre-?chorus)(\s+\d+)?\s*\]$/i);
    output.push(normalizeHeadings && match ? `[${headings[match[1].toLowerCase()] ?? 'Chorus'}${match[2] ?? ''}]` : line);
  }
  return output.join('\n').trim();
}

export function buildPrompt(fields: Record<string, string>) {
  const parts = [fields.genre, fields.mood && `${fields.mood} mood`, fields.intensity && `${fields.intensity} intensity`, fields.bpm && `${fields.bpm} BPM`, fields.time && `${fields.time} time`, fields.vocal && `${fields.vocal} vocals`, fields.texture && `Vocal texture: ${fields.texture}`, fields.instruments && `Instrumentation: ${fields.instruments}`, fields.production && `Production: ${fields.production}`, fields.arrangement && `Arrangement: ${fields.arrangement}`, fields.dynamics && `Dynamics: ${fields.dynamics}`, fields.language && `Language: ${fields.language}`, fields.notes && `Additional direction: ${fields.notes}`, fields.exclusions && `Avoid: ${fields.exclusions}`].filter(Boolean);
  return parts.join('. ').replace(/\.\./g, '.') + (parts.length ? '.' : '');
}

export interface PlanSection { id: string; name: string; bars: number; note: string }
export function sectionSeconds(bars: number, bpm: number, numerator: number, denominator: number) {
  return bars * numerator * (4 / denominator) * 60 / bpm;
}
export function formatClock(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}

export function validateSplits(values: number[]) {
  const total = values.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  return { total, remaining: Math.max(0, 100 - total), valid: values.every((value) => value >= 0 && value <= 100) && Math.abs(total - 100) < 0.001 };
}

export function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const quote = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.map(quote).join(','), ...rows.map((row) => headers.map((header) => quote(row[header] ?? '')).join(','))].join('\r\n');
}

export function safeLocalChecklistRead<T>(storage: Pick<Storage, 'getItem'>, key: string, fallback: T[]): T[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? 'null');
    return Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object' && 'label' in item && 'done' in item) ? parsed as T[] : fallback;
  } catch { return fallback; }
}

export function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch { return null; }
}
