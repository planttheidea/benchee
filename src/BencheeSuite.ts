import type {
  Benchmark,
  BenchmarkGroup,
  BenchmarkOptions,
  NormalizedOptions,
  Options,
  Result,
  Results,
  Stats,
} from './types.js';
import { createBenchmark, getOptions, now, sortResults, wait } from './utils.js';

export class BencheeSuite implements BencheeSuite {
  benchmarks: BenchmarkGroup;
  isRunning: boolean;
  options: NormalizedOptions;
  results: Results;

  constructor(passedOptions?: Options) {
    this.benchmarks = {};
    this.isRunning = false;
    this.options = getOptions(passedOptions);
    this.results = {};
  }

  /**
   * when a benchmark finishes, store the result
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  _onResult<const B extends Benchmark>(benchmark: B, error: Error | null, stats: Stats): void {
    const { onComplete, onGroupComplete, onResult } = this.options;

    const result: Result<B['name']> = {
      error,
      stats,
      name: benchmark.name,
    };

    const groupResults = this.results[benchmark.group];

    if (groupResults) {
      groupResults.push(result);
    } else {
      this.results[benchmark.group] = [result];
    }

    if (typeof onResult === 'function') {
      onResult(result);
    }

    if (typeof onGroupComplete === 'function' && !this.benchmarks[benchmark.group]?.length) {
      onGroupComplete({
        group: benchmark.group,
        results: sortResults(this.results[benchmark.group] ?? []),
      });
    }

    if (typeof onComplete === 'function') {
      for (const group in this.benchmarks) {
        if (this.benchmarks[group]?.length) {
          return;
        }
      }

      onComplete(this.results);
    }
  }

  /**
   * run the benchmark with the options passed
   */
  async _runBenchmark(benchmarkOptions: BenchmarkOptions): Promise<void> {
    const { minIterations, minTime, type } = this.options;
    const { benchmark, iterations = minIterations, startTime: passedStartTime } = benchmarkOptions;
    const runs = Math.max(iterations, 1);

    let endTime: number;

    const startTime = passedStartTime ?? now();

    try {
      this._runBenchmarkIterations(benchmark, runs);

      endTime = now();
    } catch (error: unknown) {
      endTime = now();

      const elapsed = endTime - startTime;

      const normalizedError =
        error === null || error instanceof Error
          ? error
          : new Error(
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              error?.toString(),
              { cause: error },
            );

      this._onResult(benchmark, normalizedError, {
        elapsed,
        endTime,
        startTime,
        iterations: benchmark.iterations,
        ops: 0,
        tpe: 0,
      });

      return;
    }

    benchmark.iterations += runs;

    const elapsed = Math.max(endTime - startTime, 1);

    if (type !== 'fixed' && elapsed < minTime) {
      await wait();
      await this._runBenchmark({
        benchmark,
        startTime,
        iterations: ~~(((runs * minTime) / elapsed) * 0.9),
      });

      return;
    }

    const elapsedInSeconds: number = elapsed / 1000;

    this._onResult(benchmark, null, {
      elapsed,
      endTime,
      startTime,
      iterations: benchmark.iterations,
      ops: ~~(benchmark.iterations / elapsedInSeconds),
      tpe: elapsed / benchmark.iterations,
    });
  }

  /**
   * execute the runs for the benchmarked function
   */
  _runBenchmarkIterations(benchmark: Benchmark, runs: number): void {
    let pending: number = runs;

    while (pending--) {
      benchmark.fn();
    }
  }

  /**
   * run a group of benchmarks
   */
  async _runGroup(groupBenchmarks: Benchmark[], group?: string): Promise<void> {
    if (!groupBenchmarks.length) {
      return Promise.resolve();
    }

    const {
      options: { delay, onGroupStart },
    } = this;

    if (group && typeof onGroupStart === 'function') {
      onGroupStart(group);
    }

    while (groupBenchmarks.length) {
      await wait(delay);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await this._runBenchmark({ benchmark: groupBenchmarks.shift()! });
    }
  }

  /**
   * add a benchmark to the queue to be run
   */
  add(name: string, benchmarkGroup: string | ((...args: any[]) => any), benchmarkFn?: (...args: any[]) => any): this {
    const { benchmarks, results } = this;

    const benchmark: Benchmark = createBenchmark(name, benchmarkGroup, benchmarkFn);
    const { group } = benchmark;

    if (!benchmarks[group]) {
      benchmarks[group] = [];
      results[group] = [];
    }

    benchmarks[group].push(benchmark);

    return this;
  }

  /**
   * run the benchmarks in the queue
   */
  async run(): Promise<Results> {
    const { benchmarks, isRunning, results } = this;

    if (isRunning) {
      throw new Error('Benchee is already running.');
    }

    this.isRunning = true;

    for (const group in benchmarks) {
      const benchmarkGroup = benchmarks[group];

      if (benchmarkGroup) {
        await this._runGroup(benchmarkGroup, group);
      }
    }

    this.isRunning = false;

    return results;
  }
}
