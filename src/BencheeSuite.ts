// external dependencies
import performanceNow from 'performance-now';

// utils
import { createTest, getOptions, sortResults, wait } from './utils';

class BencheeSuite {
  isRunning: boolean;
  options: Benchee.Options;
  results: Benchee.ResultGroup;
  tests: Benchee.TestGroup;

  constructor(passedOptions?: Benchee.Options) {
    this.isRunning = false;

    this.options = getOptions(passedOptions);

    this.results = {};
    this.tests = {};
  }

  /**
   * when a test finishes, store the result
   * @param test the test object that was just processed
   * @param stats the statistics of the test execution
   */
  _onResult(test: Benchee.Test, stats: Benchee.Stats): void {
    const { options: { onComplete, onGroupComplete, onResult }, results, tests } = this;

    const result: Benchee.Result = {
      stats,
      name: test.name,
    };

    results[test.group].push(result);

    if (typeof onResult === 'function') {
      onResult(result);
    }

    if (typeof onGroupComplete === 'function' && !tests[test.group].length) {
      onGroupComplete({
        group: test.group,
        results: sortResults(results[test.group]),
      });
    }

    if (typeof onComplete === 'function') {
      for (const group in tests) {
        if (tests[group].length) {
          return;
        }
      }

      onComplete(results);
    }
  }

  /**
   * run a group of tests
   * @param groupTests the tests for the given group
   * @param group the name of the group being run
   */
  async _runGroup(groupTests: Benchee.Test[], group?: string): Promise<void> {
    if (!groupTests.length) {
      return Promise.resolve();
    }

    const { options: { delay, onGroupStart } } = this;

    if (group && typeof onGroupStart === 'function') {
      onGroupStart(group);
    }

    while (groupTests.length) {
      await wait(delay);
      await this._runTest({ test: groupTests.shift() });
    }
  }

  /**
   * run the test with the options passed
   * @param testOptions the options for the given test
   */
  async _runTest(testOptions: Benchee.TestOptions): Promise<void> {
    const { options: { iterations: minIterations, minTime, type } } = this;
    const { iterations = minIterations, startTime = performanceNow(), test } = testOptions;

    let pending: number = iterations;

    try {
      while (pending--) {
        test.fn();
        test.iterations++;
      }

      const endTime: number = performanceNow();
      const elapsed: number = Math.max(endTime - startTime, 1);

      if (type !== 'fixed' && elapsed < minTime) {
        await wait();
        await this._runTest(
          {
            startTime,
            test,
            iterations: ~~(iterations * minTime / elapsed * 0.9),
          },
        );

        return;
      }

      const elapsedInSeconds: number = elapsed / 1000;

      this._onResult(test, {
        elapsed,
        endTime,
        startTime,
        iterations: test.iterations,
        ops: ~~(test.iterations / elapsedInSeconds),
        tpe: elapsed / test.iterations,
      });
    } catch (error) {
      const endTime: number = performanceNow();
      const elapsed: number = endTime - startTime;

      this._onResult(test, {
        elapsed,
        endTime,
        startTime,
        iterations: test.iterations,
        ops: 0,
        tpe: 0,
      });
    }
  }

  /**
   * add a test to the queue to be run
   * @param name the name of the test
   * @param testGroup the group the test is in, or the test function itself
   * @param testFn the test function (only when group is provided)
   */
  add(name: string, testGroup: string | Function, testFn?: Function): BencheeSuite {
    const { results, tests } = this;

    const test: Benchee.Test = createTest(name, testGroup, testFn);
    const { group } = test;

    if (!tests[group]) {
      tests[group] = [];
      results[group] = [];
    }

    tests[group].push(test);

    return this;
  }

  /**
   * run the tests in the queue
   */
  async run(): Promise<Benchee.ResultGroup> {
    const { results, isRunning, tests } = this;

    if (isRunning) {
      return;
    }

    this.isRunning = true;

    for (const group in tests) {
      await this._runGroup(tests[group], group);
    }

    this.isRunning = false;

    return results;
  }
}

export default BencheeSuite;
