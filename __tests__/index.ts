// src
import { benchmark, createSuite } from '../src/index';
import BencheeSuite from '../src/BencheeSuite';

describe('createSuite', () => {
  it('should create a new BencheeSuite with the given options', () => {
    const result = createSuite();

    expect(result).toBeInstanceOf(BencheeSuite);
  });
});

describe('benchmark', () => {
  it('should create a new suite with a single benchmark, run it', async () => {
    const name = 'name';
    const fn = jest.fn();

    const result: Benchee.Result = await benchmark(name, fn);

    expect(result.name).toBe(name);

    const stats: Benchee.Stats = result.stats;

    expect(typeof stats.elapsed).toBe('number');
    expect(typeof stats.endTime).toBe('number');
    expect(typeof stats.iterations).toBe('number');
    expect(typeof stats.ops).toBe('number');
    expect(typeof stats.startTime).toBe('number');
    expect(typeof stats.tpe).toBe('number');
  });
});
