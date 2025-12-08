/* eslint-disable @typescript-eslint/no-empty-function */

import { describe, expect, it, vi } from 'vitest';
import { BencheeSuite } from '../src/BencheeSuite.js';
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from '../src/constants.js';
import type { Benchmark } from '../src/types.js';
import { createBenchmark } from '../src/utils.js';

describe('constructor', () => {
  it('should constrct the BencheeSuite correctly', () => {
    const suite = new BencheeSuite();

    expect(suite).toBeInstanceOf(BencheeSuite);

    expect(suite.benchmarks).toEqual({});
    expect(suite.isRunning).toBe(false);
    expect(suite.options).toEqual(DEFAULT_OPTIONS);
    expect(suite.results).toEqual({});
  });
});

describe('_onResult', () => {
  it('should add the result to the results of the suite', () => {
    const suitebenchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };

    const suite: BencheeSuite = new BencheeSuite();

    suite.benchmarks[suitebenchmark.group] = [];
    suite.results[suitebenchmark.group] = [];

    suite._onResult(suitebenchmark, null, stats);

    expect(suite.results).toEqual({
      [suitebenchmark.group]: [
        {
          error: null,
          stats,
          name: suitebenchmark.name,
        },
      ],
    });
  });

  it('should handle when a benchmark errors', () => {
    const suitebenchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 0,
      endTime: 123456789000,
      iterations: 0,
      ops: 0,
      startTime: 123456789000,
      tpe: 0,
    };

    const suite: BencheeSuite = new BencheeSuite();

    suite.benchmarks[suitebenchmark.group] = [];
    suite.results[suitebenchmark.group] = [];

    const error = new Error('boom');

    suite._onResult(suitebenchmark, error, stats);

    expect(suite.results).toEqual({
      [suitebenchmark.group]: [
        {
          error,
          stats,
          name: suitebenchmark.name,
        },
      ],
    });
  });

  it('should call onResult in options if present', () => {
    const suitebenchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options = {
      onResult: vi.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    suite.benchmarks[suitebenchmark.group] = [];
    suite.results[suitebenchmark.group] = [];

    suite._onResult(suitebenchmark, null, stats);

    expect(suite.results).toEqual({
      [suitebenchmark.group]: [
        {
          error: null,
          stats,
          name: suitebenchmark.name,
        },
      ],
    });

    expect(options.onResult).toHaveBeenCalledTimes(1);
    expect(options.onResult).toHaveBeenLastCalledWith(suite.results[suitebenchmark.group]?.[0]);
  });

  it('should call onGroupComplete in options if present', () => {
    const benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options = {
      onGroupComplete: vi.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    suite.benchmarks[benchmark.group] = [];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, null, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
          error: null,
          stats,
          name: benchmark.name,
        },
      ],
    });

    expect(options.onGroupComplete).toHaveBeenCalledTimes(1);
    expect(options.onGroupComplete).toHaveBeenLastCalledWith({
      group: benchmark.group,
      results: suite.results[benchmark.group],
    });
  });

  it('should call onComplete in options if present', () => {
    const benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options = {
      onComplete: vi.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    suite.benchmarks[benchmark.group] = [];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, null, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
          error: null,
          stats,
          name: benchmark.name,
        },
      ],
    });

    expect(options.onComplete).toHaveBeenCalledTimes(1);
    expect(options.onComplete).toHaveBeenLastCalledWith(suite.results);
  });

  it('should not call onComplete in options if present but benchmarks in a group remain', () => {
    const benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options = {
      onComplete: vi.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    const existingbenchmark = {
      fn() {},
      group: benchmark.group,
      iterations: 0,
      name: 'other benchmark',
    };

    suite.benchmarks[benchmark.group] = [existingbenchmark];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, null, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
          error: null,
          stats,
          name: benchmark.name,
        },
      ],
    });

    expect(options.onComplete).toHaveBeenCalledTimes(0);
  });
});

describe('_runGroup', () => {
  it('should return an empty promise when no groupbenchmarks exist', async () => {
    const groupbenchmarks: Benchmark[] = [];

    const suite: BencheeSuite = new BencheeSuite();

    await suite._runGroup(groupbenchmarks);
  });

  it('should run all benchmarks in the group before continuing', async () => {
    const firstbenchmark = vi.fn();
    const secondbenchmark = vi.fn();

    const groupbenchmarks: Benchmark[] = [
      createBenchmark('first', firstbenchmark),
      createBenchmark('second', secondbenchmark),
    ];

    const suite: BencheeSuite = new BencheeSuite();

    suite.benchmarks[UNGROUPED_NAME] = [];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runGroup(groupbenchmarks);

    expect(suite.results[UNGROUPED_NAME].length).toBe(2);

    expect(firstbenchmark).toHaveBeenCalled();
    expect(secondbenchmark).toHaveBeenCalled();
  });

  it('should call onGroupStart if the group is passed', async () => {
    const firstbenchmark = vi.fn();
    const secondbenchmark = vi.fn();

    const groupbenchmarks: Benchmark[] = [
      createBenchmark('first', firstbenchmark),
      createBenchmark('second', secondbenchmark),
    ];
    const group = 'group';
    const options = {
      onGroupStart: vi.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    suite.benchmarks[UNGROUPED_NAME] = [];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runGroup(groupbenchmarks, group);

    expect(options.onGroupStart).toHaveBeenCalledTimes(1);
    expect(options.onGroupStart).toHaveBeenLastCalledWith(group);

    expect(suite.results[UNGROUPED_NAME].length).toBe(2);

    expect(firstbenchmark).toHaveBeenCalled();
    expect(secondbenchmark).toHaveBeenCalled();
  });
});

describe('_runBenchmark', () => {
  it('should run the benchmark and calculate the result when type is adaptive', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const benchmarkOptions = {
      benchmark: {
        fn: vi.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      },
    };

    suite.benchmarks[UNGROUPED_NAME] = [benchmarkOptions.benchmark];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runBenchmark(benchmarkOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result?.stats.elapsed).toBe('number');
    expect(typeof result?.stats.endTime).toBe('number');
    expect(typeof result?.stats.iterations).toBe('number');
    expect(typeof result?.stats.ops).toBe('number');
    expect(typeof result?.stats.startTime).toBe('number');
    expect(typeof result?.stats.tpe).toBe('number');
  });

  it('should run the benchmark and calculate the result when type is fixed', async () => {
    const suite: BencheeSuite = new BencheeSuite({
      type: 'fixed',
    });

    const benchmarkOptions = {
      benchmark: {
        fn: vi.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      },
    };

    suite.benchmarks[UNGROUPED_NAME] = [benchmarkOptions.benchmark];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runBenchmark(benchmarkOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result?.stats.elapsed).toBe('number');
    expect(typeof result?.stats.endTime).toBe('number');
    expect(result?.stats.iterations).toBe(DEFAULT_OPTIONS.minIterations);
    expect(typeof result?.stats.ops).toBe('number');
    expect(typeof result?.stats.startTime).toBe('number');
    expect(typeof result?.stats.tpe).toBe('number');
  });

  it('should handle benchmarks that create errors', async () => {
    const suite: BencheeSuite = new BencheeSuite({
      type: 'fixed',
    });

    const benchmarkOptions = {
      benchmark: {
        fn: vi.fn(() => {
          throw new Error('boom');
        }),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      },
    };

    suite.benchmarks[UNGROUPED_NAME] = [benchmarkOptions.benchmark];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runBenchmark(benchmarkOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result?.stats.elapsed).toBe('number');
    expect(typeof result?.stats.endTime).toBe('number');
    expect(result?.stats.iterations).toBe(0);
    expect(result?.stats.ops).toBe(0);
    expect(typeof result?.stats.startTime).toBe('number');
    expect(result?.stats.tpe).toBe(0);
  });
});

describe('_runBenchmarkIterations', () => {
  it('should run the benchmark function the number of runs specified', () => {
    const benchmark = {
      fn: vi.fn(),
      group: UNGROUPED_NAME,
      iterations: 0,
      name: 'name',
    };

    const suite: BencheeSuite = new BencheeSuite();

    const runs = 10;

    suite._runBenchmarkIterations(benchmark, runs);

    expect(benchmark.fn).toHaveBeenCalledTimes(runs);
  });
});

describe('add', () => {
  it('should add a benchmark to the queue', () => {
    const name = 'name';
    const fn = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    suite.add(name, fn);

    expect(suite.benchmarks).toEqual({
      [UNGROUPED_NAME]: [createBenchmark(name, fn)],
    });
  });

  it('should add a benchmark to the queue with a group associated', () => {
    const name = 'name';
    const group = 'group';
    const fn = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [createBenchmark(name, group, fn)],
    });

    expect(result).toBe(suite);
  });

  it('should add a benchmark to the queue without creating a new group if the group exists', () => {
    const name = 'name';
    const group = 'group';
    const fn = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [createBenchmark(name, group, fn)],
    });

    expect(result).toBe(suite);

    const otherResult = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [createBenchmark(name, group, fn), createBenchmark(name, group, fn)],
    });

    expect(otherResult).toBe(suite);
  });
});

describe('run', () => {
  it('should run all groups and return the results', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedbenchmark = vi.fn();
    const groupedbenchmark = vi.fn();

    const groupName = 'group';

    const promise = suite
      .add('ungrouped benchmark', ungroupedbenchmark)
      .add('grouped benchmark', groupName, groupedbenchmark)
      .run();

    expect(suite.isRunning).toBe(true);

    const results = await promise;

    expect(suite.isRunning).toBe(false);

    expect(results[UNGROUPED_NAME]?.length).toBe(1);
    expect(results[groupName]?.length).toBe(1);
  });

  it('should return a rejected promise if you try to run while running', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedbenchmark = vi.fn();
    const groupedbenchmark = vi.fn();

    const groupName = 'group';

    void suite
      .add('ungrouped benchmark', ungroupedbenchmark)
      .add('grouped benchmark', groupName, groupedbenchmark)
      .run();

    expect(suite.isRunning).toBe(true);

    await expect(suite.run()).rejects.toEqual(new Error('Benchee is already running.'));
  });
});
