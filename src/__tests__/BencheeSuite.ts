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

  it('should add call onResult in options if present', () => {
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

  it('should add call onGroupComplete in options if present', () => {
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

  it('should add call onComplete in options if present', () => {
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

describe('_runTest', () => { });

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
});

describe('run', () => { });