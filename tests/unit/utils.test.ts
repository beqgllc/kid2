import { describe, expect, it } from 'vitest';
import { slugify, formatDuration } from '../../src/lib/utils';

describe('utils',()=>{it('slugifies titles',()=>expect(slugify('Burn With Me!')).toBe('burn-with-me'));it('formats durations',()=>expect(formatDuration(125)).toBe('2:05'));});
