import { describe, expect, it, vi } from 'vitest';
import { BencheeSuite } from '../src/BencheeSuite.js';
import { benchmark, createSuite } from '../src/index.js';

describe('createSuite', () => {
  it('should create a new BencheeSuite with the given options', () => {
    const result = createSuite();

    expect(result).toBeInstanceOf(BencheeSuite);
  });
});

describe('benchmark', () => {
  it('should create a new suite with a single benchmark, run it', async () => {
    const name = 'name';
    const fn = vi.fn();

    const result = await benchmark(name, fn);

    expect(result.name).toBe(name);

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(typeof result.stats.iterations).toBe('number');
    expect(typeof result.stats.ops).toBe('number');
    expect(typeof result.stats.startTime).toBe('number');
    expect(typeof result.stats.tpe).toBe('number');
  });
});
