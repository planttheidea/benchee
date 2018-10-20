// src
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from '../constants';
import { createBenchmark, getOptions, sortResults, wait } from '../utils';

describe('createBenchmark', () => {
  it('should create a benchmark without a group assignment', () => {
    const name: string = 'name';
    const fn: Function = () => {};

    const result: Benchee.Benchmark = createBenchmark(name, fn);

    expect(result).toEqual({
      fn,
      group: UNGROUPED_NAME,
      iterations: 0,
      name,
    });
  });

  it('should create a benchmark with a group assignment', () => {
    const name: string = 'name';
    const group: string = 'group';
    const fn: Function = () => {};

    const result: Benchee.Benchmark = createBenchmark(name, group, fn);

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
    const passedOptions: Benchee.Options = { onComplete() {} };

    const result: Benchee.Options = getOptions(passedOptions);

    expect(result).toEqual({
      ...DEFAULT_OPTIONS,
      ...passedOptions,
    });
  });

  it('should get the default options when passedOptions is null', () => {
    const passedOptions: any = null;

    const result = getOptions(passedOptions);

    expect(result).toEqual(DEFAULT_OPTIONS);
  });
});

describe('sortOptions', () => {
  it('should get the results sorted by ops', () => {
    const results: Benchee.Result[] = [
      {
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

    const result: Benchee.Result[] = sortResults(results);

    expect(result).toBe(results);
    expect(result).toEqual([
      {
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
    const delay = 100;

    jest.useFakeTimers();

    wait(delay);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), delay);
  });

  it('should wait for the default time before resolving', async () => {
    jest.useFakeTimers();

    wait();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);
  });
});
