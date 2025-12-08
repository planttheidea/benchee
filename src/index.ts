import { BencheeSuite } from './BencheeSuite.js';
import type { BenchmarkFn, Options, Result, Results } from './types.js';

/**
 * create a new benchee suite
 * @param passedOptions the options to create the suite with
 * @returns the new benchee suite
 */
export const createSuite = (passedOptions?: Options): BencheeSuite => new BencheeSuite(passedOptions);

/**
 * benchmark one thing standalone, outside of a given suite
 * @param name the name of the test
 * @param fn the test function
 */
export const benchmark = (name: string, fn: BenchmarkFn): Promise<Result> =>
  createSuite()
    .add(name, fn)
    .run()
    .then((results: Results) => {
      if (!results.ungrouped?.[0]) {
        throw new Error('No results found.');
      }

      return results.ungrouped[0];
    });
