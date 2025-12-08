/* eslint-disable @typescript-eslint/no-empty-function */

import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from '../src/constants.js';
import { createBenchmark, getOptions, now, sortResults, wait } from '../src/utils.js';

describe('createBenchmark', () => {
  it('should create a benchmark without a group assignment', () => {
    const name = 'name';
    const fn = () => {};

    const result = createBenchmark(name, fn);

    expect(result).toEqual({
      fn,
      group: UNGROUPED_NAME,
      iterations: 0,
      name,
    });
  });

  it('should create a benchmark with a group assignment', () => {
    const name = 'name';
    const group = 'group';
    const fn = () => {};

    const result = createBenchmark(name, group, fn);

    expect(result).toEqual({
      fn,
      group,
      iterations: 0,
      name,
    });
  });
});

describe('getOptions', () => {
  it('should get the merged options when passedOptions is an object', () => {
    const passedOptions = { onComplete() {} };

    const result = getOptions(passedOptions);

    expect(result).toEqual({
      ...DEFAULT_OPTIONS,
      ...passedOptions,
    });
  });

  it('should get the default options when passedOptions is null', () => {
    // @ts-expect-error = Allow testing error condition.
    const result = getOptions(null);

    expect(result).toEqual(DEFAULT_OPTIONS);
  });
});

describe('now', () => {
  it('should get the correct time in fractions of a millisecond', () => {
    const result = now();
    const dateResult = Date.now();

    expect(Math.floor(result)).toEqual(dateResult);
  });
});

describe('sortOptions', () => {
  it('should get the results sorted by ops', () => {
    const results = [
      {
        error: null,
        name: 'second',
        stats: {
          elapsed: 10,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.5,
          startTime: 123456789000,
          tpe: 2,
        },
      },
      {
        error: null,
        name: 'third',
        stats: {
          elapsed: 20,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.25,
          startTime: 123456789000,
          tpe: 4,
        },
      },
      {
        error: null,
        name: 'first',
        stats: {
          elapsed: 10,
          endTime: 234567891000,
          iterations: 20,
          ops: 2,
          startTime: 123456789000,
          tpe: 0.5,
        },
      },
      {
        error: null,
        name: 'fourth',
        stats: {
          elapsed: 20,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.25,
          startTime: 123456789000,
          tpe: 4,
        },
      },
    ];

    const result = sortResults(results);

    expect(result).toBe(results);
    expect(result).toEqual([
      {
        error: null,
        name: 'first',
        stats: {
          elapsed: 10,
          endTime: 234567891000,
          iterations: 20,
          ops: 2,
          startTime: 123456789000,
          tpe: 0.5,
        },
      },
      {
        error: null,
        name: 'second',
        stats: {
          elapsed: 10,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.5,
          startTime: 123456789000,
          tpe: 2,
        },
      },
      {
        error: null,
        name: 'third',
        stats: {
          elapsed: 20,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.25,
          startTime: 123456789000,
          tpe: 4,
        },
      },
      {
        error: null,
        name: 'fourth',
        stats: {
          elapsed: 20,
          endTime: 234567891000,
          iterations: 5,
          ops: 0.25,
          startTime: 123456789000,
          tpe: 4,
        },
      },
    ]);
  });
});

describe('wait', () => {
  it('should wait for the passed time before resolving', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const delay = 100;

    await wait(delay);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(expect.any(Function), delay);

    spy.mockRestore();
  });

  it('should wait for the default time before resolving', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    await wait();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 0);

    spy.mockRestore();
  });
});
