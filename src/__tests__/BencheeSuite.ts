// src
import BencheeSuite from '../BencheeSuite';
import { DEFAULT_OPTIONS, UNGROUPED_NAME } from '../constants';
import { createTest } from '../utils';

describe('constructor', () => {
  it('should constrct the BencheeSuite correctly', () => {
    const suite = new BencheeSuite();

    expect(suite).toBeInstanceOf(BencheeSuite);

    expect(suite.isRunning).toBe(false);
    expect(suite.options).toEqual(DEFAULT_OPTIONS);
    expect(suite.results).toEqual({});
    expect(suite.tests).toEqual({});
  });
});

describe('_onResult', () => {
  it('should add the result to the results of the suite', () => {
    const suiteTest: Benchee.Test = {
      fn() { },
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

    suite.results[suiteTest.group] = [];
    suite.tests[suiteTest.group] = [];

    suite._onResult(suiteTest, stats);

    expect(suite.results).toEqual({
      [suiteTest.group]: [
        {
          stats,
          name: suiteTest.name,
        }
      ]
    });
  });

  it('should call onResult in options if present', () => {
    const suiteTest: Benchee.Test = {
      fn() { },
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

    suite.results[suiteTest.group] = [];
    suite.tests[suiteTest.group] = [];

    suite._onResult(suiteTest, stats);

    expect(suite.results).toEqual({
      [suiteTest.group]: [
        {
          stats,
          name: suiteTest.name,
        }
      ]
    });

    expect(options.onResult).toHaveBeenCalledTimes(1);
    expect(options.onResult).toHaveBeenLastCalledWith(suite.results[suiteTest.group][0]);
  });

  it('should call onGroupComplete in options if present', () => {
    const test: Benchee.Test = {
      fn() { },
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

    suite.results[test.group] = [];
    suite.tests[test.group] = [];

    suite._onResult(test, stats);

    expect(suite.results).toEqual({
      [test.group]: [
        {
          stats,
          name: test.name,
        }
      ]
    });

    expect(options.onGroupComplete).toHaveBeenCalledTimes(1);
    expect(options.onGroupComplete).toHaveBeenLastCalledWith({
      group: test.group,
      results: suite.results[test.group],
    });
  });

  it('should call onComplete in options if present', () => {
    const test: Benchee.Test = {
      fn() { },
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

    suite.results[test.group] = [];
    suite.tests[test.group] = [];

    suite._onResult(test, stats);

    expect(suite.results).toEqual({
      [test.group]: [
        {
          stats,
          name: test.name,
        }
      ]
    });

    expect(options.onComplete).toHaveBeenCalledTimes(1);
    expect(options.onComplete).toHaveBeenLastCalledWith(suite.results);
  });

  it('should not call onComplete in options if present but tests in a group remain', () => {
    const test: Benchee.Test = {
      fn() { },
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

    const existingTest: Benchee.Test = {
      fn() {},
      group: test.group,
      iterations: 0,
      name: 'other test',
    };

    suite.results[test.group] = [];
    suite.tests[test.group] = [existingTest];

    suite._onResult(test, stats);

    expect(suite.results).toEqual({
      [test.group]: [
        {
          stats,
          name: test.name,
        }
      ]
    });

    expect(options.onComplete).toHaveBeenCalledTimes(0);
  });
});

describe('_runGroup', () => {
  it('should return an empty promise when no groupTests exist', async () => {
    const groupTests: Benchee.Test[] = [];

    const suite: BencheeSuite = new BencheeSuite();

    await suite._runGroup(groupTests);
  });

  it('should run all tests in the group before continuing', async () => {
    const firstTest: Function = jest.fn();
    const secondTest: Function = jest.fn();

    const groupTests: Benchee.Test[] = [
      createTest('first', firstTest),
      createTest('second', secondTest),
    ];

    const suite: BencheeSuite = new BencheeSuite();

    suite.results[UNGROUPED_NAME] = [];
    suite.tests[UNGROUPED_NAME] = [];

    await suite._runGroup(groupTests);

    expect(suite.results[UNGROUPED_NAME].length).toBe(2);

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });

  it('should call onGroupStart if the group is passed', async () => {
    const firstTest: Function = jest.fn();
    const secondTest: Function = jest.fn();

    const groupTests: Benchee.Test[] = [
      createTest('first', firstTest),
      createTest('second', secondTest),
    ];
    const group: string = 'group';
    const options: Benchee.Options = {
      onGroupStart: jest.fn(),
    };

    const suite: BencheeSuite = new BencheeSuite(options);

    suite.results[UNGROUPED_NAME] = [];
    suite.tests[UNGROUPED_NAME] = [];

    await suite._runGroup(groupTests, group);

    expect(options.onGroupStart).toHaveBeenCalledTimes(1);
    expect(options.onGroupStart).toHaveBeenLastCalledWith(group);

    expect(suite.results[UNGROUPED_NAME].length).toBe(2);

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });
});

describe('_runTest', () => { 
  it('should run the test iterations and calculate the result when type is adaptive', async () => {
    const suite = new BencheeSuite();

    const testOptions: Benchee.TestOptions = {
      test: {
        fn: jest.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      }
    };

    suite.results[UNGROUPED_NAME] = [];
    suite.tests[UNGROUPED_NAME] = [testOptions.test];

    await suite._runTest(testOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result: Benchee.Result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(typeof result.stats.iterations).toBe('number');
    expect(typeof result.stats.ops).toBe('number');
    expect(typeof result.stats.startTime).toBe('number');
    expect(typeof result.stats.tpe).toBe('number');
  });

  it('should run the test iterations and calculate the result when type is fixed', async () => {
    const suite = new BencheeSuite({
      type: 'fixed',
    });

    const testOptions: Benchee.TestOptions = {
      test: {
        fn: jest.fn(),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      }
    };

    suite.results[UNGROUPED_NAME] = [];
    suite.tests[UNGROUPED_NAME] = [testOptions.test];

    await suite._runTest(testOptions);

    expect(suite.results[UNGROUPED_NAME].length).toBe(1);

    const result: Benchee.Result = suite.results[UNGROUPED_NAME][0];

    expect(typeof result.stats.elapsed).toBe('number');
    expect(typeof result.stats.endTime).toBe('number');
    expect(result.stats.iterations).toBe(DEFAULT_OPTIONS.iterations);
    expect(typeof result.stats.ops).toBe('number');
    expect(typeof result.stats.startTime).toBe('number');
    expect(typeof result.stats.tpe).toBe('number');
  });

  it('should handle tests that create errors', async () => {
    const suite = new BencheeSuite({
      type: 'fixed',
    });

    const testOptions: Benchee.TestOptions = {
      test: {
        fn: jest.fn(() => {
          throw new Error('boom');
        }),
        group: UNGROUPED_NAME,
        iterations: 0,
        name: 'name',
      }
    };

    suite.results[UNGROUPED_NAME] = [];
    suite.tests[UNGROUPED_NAME] = [testOptions.test];

    await suite._runTest(testOptions);

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
  it('should add a test to the queue', () => {
    const name: string = 'name';
    const fn: Function = () => { };

    const suite: BencheeSuite = new BencheeSuite();

    suite.add(name, fn);

    expect(suite.tests).toEqual({
      [UNGROUPED_NAME]: [createTest(name, fn)]
    });
  });

  it('should add a test to the queue with a group associated', () => {
    const name: string = 'name';
    const group: string = 'group';
    const fn: Function = () => { };

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.tests).toEqual({
      [group]: [createTest(name, group, fn)]
    });

    expect(result).toBe(suite);
  });

  it('should add a test to the queue without creating a new test group if the group exists', () => {
    const name: string = 'name';
    const group: string = 'group';
    const fn: Function = () => { };

    const suite: BencheeSuite = new BencheeSuite();

    const result = suite.add(name, group, fn);

    expect(suite.tests).toEqual({
      [group]: [createTest(name, group, fn)]
    });

    expect(result).toBe(suite);

    const otherResult = suite.add(name, group, fn);

    expect(suite.tests).toEqual({
      [group]: [createTest(name, group, fn), createTest(name, group, fn)]
    });

    expect(otherResult).toBe(suite);
  });
});

describe('run', () => { 
  it('should run all groups and return the results', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedTest = jest.fn();
    const groupedTest = jest.fn();

    const groupName = 'group';

    const promise = suite
      .add('ungrouped test', ungroupedTest)
      .add('grouped test', groupName, groupedTest)
      .run();

    expect(suite.isRunning).toBe(true);

    const results: Benchee.ResultGroup = await promise;

    expect(suite.isRunning).toBe(false);

    expect(results[UNGROUPED_NAME].length).toBe(1);
    expect(results[groupName].length).toBe(1);
  });

  it('should return a rejected promise if you try to run while running', async () => {
    const suite: BencheeSuite = new BencheeSuite();

    const ungroupedTest = jest.fn();
    const groupedTest = jest.fn();

    const groupName = 'group';

    let promise;

    promise = suite
      .add('ungrouped test', ungroupedTest)
      .add('grouped test', groupName, groupedTest)
      .run();

    expect(suite.isRunning).toBe(true);
    
    expect(suite.run()).rejects.toEqual(new Error('Benchee is already running.'));
  });
});