// constants
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from './constants';

const hasOwnProperty: Function = Object.prototype.hasOwnProperty;

/**
 * create a benchmark object based on the name, group, and fn passed
 * @param name the name of the benchmark
 * @param benchmarkGroup either the benchmark function, or the group the benchmark lives in
 * @param benchmarkFn the benchmark function (only when a group is specified)
 */
export const createBenchmark = (
  name: string,
  benchmarkGroup: string | Function,
  benchmarkFn?: Function,
): Benchee.Benchmark => ({
  fn: typeof benchmarkGroup === 'function' ? benchmarkGroup : benchmarkFn,
  group: typeof benchmarkGroup === 'string' ? benchmarkGroup : UNGROUPED_NAME,
  iterations: 0,
  name,
});

/**
 * shallowly merge the objects passed into a single new object
 * @param sources the sources to merge into a single object
 * @returns the merged object
 */
export const mergeObjects = (...sources: Object[]): Object => {
  const target: { [key: string]: any } = {};

  let source: { [key: string]: any };

  for (let index: number = 0; index < sources.length; index++) {
    source = sources[index];

    for (const key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * get the options passed merged with the defaults
 * @param passedOptions the options passed to merge
 * @returns the merged options
 */
export const getOptions = (passedOptions?: Benchee.Options): Benchee.Options =>
  passedOptions && typeof passedOptions === 'object'
    ? mergeObjects(DEFAULT_OPTIONS, passedOptions)
    : mergeObjects(DEFAULT_OPTIONS);

/**
 * sort the results by operations per second (descending)
 * @param results the results to sort
 * @returns the sorted results
 */
export const sortResults = (results: Benchee.Result[]): Benchee.Result[] =>
  results.sort(
    (a: Benchee.Result, b: Benchee.Result): number => {
      if (a.stats.ops > b.stats.ops) {
        return -1;
      }

      if (a.stats.ops < b.stats.ops) {
        return 1;
      }

      return 0;
    },
  );

/**
 * wait the period of time passed (defaulting to 0)
 * @param delay the time to wait before resolving
 * @returns the promise that is resolved after the delay
 */
export const wait = (delay: number = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));
