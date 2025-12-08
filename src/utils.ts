import { DEFAULT_OPTIONS, UNGROUPED_NAME } from './constants.js';
import type { Benchmark, BenchmarkFn, NormalizedOptions, Options, Result } from './types.js';

/**
 * create a benchmark object based on the name, group, and fn passed
 * @param name the name of the benchmark
 * @param benchmarkGroup either the benchmark function, or the group the benchmark lives in
 * @param benchmarkFn the benchmark function (only when a group is specified)
 */
export const createBenchmark = <N extends string>(
  name: N,
  benchmarkGroup: string | BenchmarkFn,
  benchmarkFn?: BenchmarkFn,
): Benchmark<N> => {
  const fn = typeof benchmarkGroup === 'function' ? benchmarkGroup : benchmarkFn;

  if (typeof fn !== 'function') {
    throw new ReferenceError(
      `No benchmark function provided; expected \`benchmarkFn\` to be a function, received: ${typeof benchmarkFn}`,
    );
  }

  return {
    fn,
    group: typeof benchmarkGroup === 'string' ? benchmarkGroup : UNGROUPED_NAME,
    iterations: 0,
    name,
  };
};

/**
 * get the options passed merged with the defaults
 * @param passedOptions the options passed to merge
 * @returns the merged options
 */
export const getOptions = (passedOptions?: Options): NormalizedOptions =>
  passedOptions && typeof passedOptions === 'object' ? Object.assign(DEFAULT_OPTIONS, passedOptions) : DEFAULT_OPTIONS;

/**
 * return the current timestamp in fraction of milliseconds (as accurate as possible)
 * @returns the current timestamp
 */
export const now = (() => {
  try {
    // Attempt the operation to verify it can work lazily.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    performance.timeOrigin + performance.now();

    return () => performance.timeOrigin + performance.now();
  } catch {
    try {
      const loadNs = process.hrtime();
      const loadMs = Date.now();

      const getCurrentTime = () => {
        const diffNs = process.hrtime(loadNs);

        return (loadMs * 1e6 + (diffNs[0] * 1e9 + diffNs[1])) / 1000000;
      };

      return getCurrentTime;
    } catch {
      return () => Date.now();
    }
  }
})();

/**
 * sort the results by operations per second (descending)
 * @param results the results to sort
 * @returns the sorted results
 */
export const sortResults = (results: Result[]): Result[] =>
  results.sort((a: Result, b: Result): number => {
    if (a.stats.ops > b.stats.ops) {
      return -1;
    }

    if (a.stats.ops < b.stats.ops) {
      return 1;
    }

    return 0;
  });

/**
 * wait the period of time passed (defaulting to 0)
 * @param delay the time to wait before resolving
 * @returns the promise that is resolved after the delay
 */
export const wait = (delay = 0): Promise<void> => new Promise((resolve) => setTimeout(resolve, delay));
