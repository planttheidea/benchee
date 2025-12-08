import { BencheeSuite } from './BencheeSuite.js';
import type { BenchmarkFn, BenchmarkOptions, Result, Results, SuiteOptions } from './types.js';

/**
 * Create a new benchee suite.
 */
export const createSuite = (passedOptions?: SuiteOptions): BencheeSuite => new BencheeSuite(passedOptions);

/**
 * Benchmark one function standalone, outside the context of a suite.
 */
export function benchmark<N extends string>(
  name: N,
  fn: BenchmarkFn,
  options?: BenchmarkOptions<N>,
): Promise<Result<N>> {
  return createSuite({ onResult: options?.onComplete } as SuiteOptions)
    .add(name, fn)
    .run()
    .then((results: Results) => {
      if (!results.ungrouped?.[0]) {
        throw new Error('No results found.');
      }

      return results.ungrouped[0];
    }) as Promise<Result<N>>;
}
