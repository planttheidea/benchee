import BencheeSuite from './BencheeSuite';

/**
 * create a new benchee suite
 * @param passedOptions the options to create the suite with
 * @returns the new benchee suite
 */
export const createSuite = (passedOptions?: Benchee.Options): BencheeSuite =>
  new BencheeSuite(passedOptions);

/**
 * benchmark one thing standalone, outside of a given suite
 * @param name the name of the test
 * @param fn the test function
 */
export const benchmark = (
  name: string,
  fn: Function,
): Promise<Benchee.Result> =>
  createSuite()
    .add(name, fn)
    .run()
    .then((results: Benchee.Results) => results.ungrouped[0]);
