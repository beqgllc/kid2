import { describe, expect, it } from 'vitest';
import { analyzeBars, buildPrompt, estimateSyllables, formatClock, formatLyrics, safeExternalUrl, safeLocalChecklistRead, sectionSeconds, toCsv, validateSplits } from '../../src/pages/Studio/logic';

describe('ATTIKID Studio helpers', () => {
  it('counts lyric lines as bars and skips section labels', () => {
    const result = analyzeBars('[Verse 1]\nWalking through the midnight\nI keep moving', 7);
    expect(result.bars).toBe(2);
    expect(result.rows[0]?.syllables).toBeGreaterThan(0);
    expect(result.words).toBe(7);
  });

  it('formats headings and whitespace without changing lyric words', () => {
    expect(formatLyrics(' [hook]  \n\n\nKeep my words\n\n', true)).toBe('[Chorus]\n\nKeep my words');
    expect(estimateSyllables('beautiful')).toBe(3);
  });

  it('builds a readable production brief from selected fields', () => {
    expect(buildPrompt({ genre: 'Alt R&B', mood: 'late night', bpm: '88' })).toBe('Alt R&B. late night mood. 88 BPM.');
  });

  it('accounts for meter denominator in section runtime', () => {
    expect(sectionSeconds(4, 120, 4, 4)).toBe(8);
    expect(sectionSeconds(4, 120, 6, 8)).toBe(6);
    expect(formatClock(65)).toBe('1:05');
  });

  it('validates splits and escapes CSV values', () => {
    expect(validateSplits([50, 50]).valid).toBe(true);
    expect(validateSplits([60, 50]).valid).toBe(false);
    expect(toCsv([{ Name: 'A "Name"', Share: 50 }])).toBe('"Name","Share"\r\n"A ""Name""","50"');
  });

  it('handles malformed local checklist data and only allows http(s) URLs', () => {
    expect(safeLocalChecklistRead({ getItem: () => '{broken' }, 'key', [])).toEqual([]);
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('https://example.com')).toBe('https://example.com/');
  });
});
