// src
import BencheeSuite from '../BencheeSuite';
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from '../constants';
import { createBenchmark } from '../utils';

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
    const suitebenchmark: Benchee.Benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats: Benchee.Stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };

    const suite = new BencheeSuite();

    suite.benchmarks[suitebenchmark.group] = [];
    suite.results[suitebenchmark.group] = [];

    suite._onResult(suitebenchmark, stats);

    expect(suite.results).toEqual({
      [suitebenchmark.group]: [
        {
          stats,
          name: suitebenchmark.name,
        },
      ],
    });
  });

  it('should call onResult in options if present', () => {
    const suitebenchmark: Benchee.Benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats: Benchee.Stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options: Benchee.Options = {
      onResult: jest.fn(),
    };

    const suite = new BencheeSuite(options);

    suite.benchmarks[suitebenchmark.group] = [];
    suite.results[suitebenchmark.group] = [];

    suite._onResult(suitebenchmark, stats);

    expect(suite.results).toEqual({
      [suitebenchmark.group]: [
        {
          stats,
          name: suitebenchmark.name,
        },
      ],
    });

    expect(options.onResult).toHaveBeenCalledTimes(1);
    expect(options.onResult).toHaveBeenLastCalledWith(
      suite.results[suitebenchmark.group][0],
    );
  });

  it('should call onGroupComplete in options if present', () => {
    const benchmark: Benchee.Benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats: Benchee.Stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options: Benchee.Options = {
      onGroupComplete: jest.fn(),
    };

    const suite = new BencheeSuite(options);

    suite.benchmarks[benchmark.group] = [];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
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
    const benchmark: Benchee.Benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats: Benchee.Stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options: Benchee.Options = {
      onComplete: jest.fn(),
    };

    const suite = new BencheeSuite(options);

    suite.benchmarks[benchmark.group] = [];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
          stats,
          name: benchmark.name,
        },
      ],
    });

    expect(options.onComplete).toHaveBeenCalledTimes(1);
    expect(options.onComplete).toHaveBeenLastCalledWith(suite.results);
  });

  it('should not call onComplete in options if present but benchmarks in a group remain', () => {
    const benchmark: Benchee.Benchmark = {
      fn() {},
      group: UNGROUPED_NAME,
      iterations: 10,
      name: 'name',
    };
    const stats: Benchee.Stats = {
      elapsed: 10,
      endTime: 234567891000,
      iterations: 20,
      ops: 2,
      startTime: 123456789000,
      tpe: 0.5,
    };
    const options: Benchee.Options = {
      onComplete: jest.fn(),
    };

    const suite = new BencheeSuite(options);

    const existingbenchmark: Benchee.Benchmark = {
      fn() {},
      group: benchmark.group,
      iterations: 0,
      name: 'other benchmark',
    };

    suite.benchmarks[benchmark.group] = [existingbenchmark];
    suite.results[benchmark.group] = [];

    suite._onResult(benchmark, stats);

    expect(suite.results).toEqual({
      [benchmark.group]: [
        {
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
    const groupbenchmarks: Benchee.Benchmark[] = [];

    const suite: BencheeSuite = new BencheeSuite();

    await suite._runGroup(groupbenchmarks);
  });

  it('should run all benchmarks in the group before continuing', async () => {
    const firstbenchmark: Function = jest.fn();
    const secondbenchmark: Function = jest.fn();

    const groupbenchmarks: Benchee.Benchmark[] = [
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
    const firstbenchmark: Function = jest.fn();
    const secondbenchmark: Function = jest.fn();

    const groupbenchmarks: Benchee.Benchmark[] = [
      createBenchmark('first', firstbenchmark),
      createBenchmark('second', secondbenchmark),
    ];
    const group: string = 'group';
    const options: Benchee.Options = {
      onGroupStart: jest.fn(),
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
    const suite = new BencheeSuite();

    const benchmarkOptions: Benchee.BenchmarkOptions = {
      benchmark: {
        fn: jest.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      },
    };

    suite.benchmarks[UNGROUPED_NAME] = [benchmarkOptions.benchmark];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runBenchmark(benchmarkOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result: Benchee.Result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(typeof result.stats.iterations).toBe('number');
    expect(typeof result.stats.ops).toBe('number');
    expect(typeof result.stats.startTime).toBe('number');
    expect(typeof result.stats.tpe).toBe('number');
  });

  it('should run the benchmark and calculate the result when type is fixed', async () => {
    const suite = new BencheeSuite({
      type: 'fixed',
    });

    const benchmarkOptions: Benchee.BenchmarkOptions = {
      benchmark: {
        fn: jest.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      },
    };

    suite.benchmarks[UNGROUPED_NAME] = [benchmarkOptions.benchmark];
    suite.results[UNGROUPED_NAME] = [];

    await suite._runBenchmark(benchmarkOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result: Benchee.Result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(result.stats.iterations).toBe(DEFAULT_OPTIONS.minIterations);
    expect(typeof result.stats.ops).toBe('number');
    expect(typeof result.stats.startTime).toBe('number');
    expect(typeof result.stats.tpe).toBe('number');
  });

  it('should handle benchmarks that create errors', async () => {
    const suite = new BencheeSuite({
      type: 'fixed',
    });

    const benchmarkOptions: Benchee.BenchmarkOptions = {
      benchmark: {
        fn: jest.fn(() => {
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

    const result: Benchee.Result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(result.stats.iterations).toBe(0);
    expect(result.stats.ops).toBe(0);
    expect(typeof result.stats.startTime).toBe('number');
    expect(result.stats.tpe).toBe(0);
  });
});

describe('add', () => {
  it('should add a benchmark to the queue', () => {
    const name: string = 'name';
    const fn: Function = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    suite.add(name, fn);

    expect(suite.benchmarks).toEqual({
      [UNGROUPED_NAME]: [createBenchmark(name, fn)],
    });
  });

  it('should add a benchmark to the queue with a group associated', () => {
    const name: string = 'name';
    const group: string = 'group';
    const fn: Function = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [createBenchmark(name, group, fn)],
    });

    expect(result).toBe(suite);
  });

  it('should add a benchmark to the queue without creating a new group if the group exists', () => {
    const name: string = 'name';
    const group: string = 'group';
    const fn: Function = () => {};

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [createBenchmark(name, group, fn)],
    });

    expect(result).toBe(suite);

    const otherResult = suite.add(name, group, fn);

    expect(suite.benchmarks).toEqual({
      [group]: [
        createBenchmark(name, group, fn),
        createBenchmark(name, group, fn),
      ],
    });

    expect(otherResult).toBe(suite);
  });
});

describe('run', () => {
  it('should run all groups and return the results', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedbenchmark = jest.fn();
    const groupedbenchmark = jest.fn();

    const groupName = 'group';

    const promise = suite
      .add('ungrouped benchmark', ungroupedbenchmark)
      .add('grouped benchmark', groupName, groupedbenchmark)
      .run();

    expect(suite.isRunning).toBe(true);

    const results: Benchee.Results = await promise;

    expect(suite.isRunning).toBe(false);

    expect(results[UNGROUPED_NAME].length).toBe(1);
    expect(results[groupName].length).toBe(1);
  });

  it('should return a rejected promise if you try to run while running', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedbenchmark = jest.fn();
    const groupedbenchmark = jest.fn();

    const groupName = 'group';

    let promise;

    promise = suite
      .add('ungrouped benchmark', ungroupedbenchmark)
      .add('grouped benchmark', groupName, groupedbenchmark)
      .run();

    expect(suite.isRunning).toBe(true);

    expect(suite.run()).rejects.toEqual(
      new Error('Benchee is already running.'),
    );
  });
});
