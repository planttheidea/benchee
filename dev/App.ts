import Table from 'cli-table3';
import { benchmark, createSuite } from '../src/index.js';
import type { Result } from '../src/types.js';

const getResults = (results: Result[]): string => {
  const table = new Table({
    head: ['Name', 'Ops / sec'],
  });

  results.forEach(({ name, stats }) => {
    table.push([name, stats.ops.toLocaleString()]);
  });

  return table.toString();
};

const sum = (a: number, b: number): number => a + b;

const runSingleBenchmark = async () => {
  const results = await benchmark('basic sum', () => sum(1, 2));

  console.log('sum results');
  console.log(
    getResults([
      {
        error: null,
        name: 'sum',
        stats: results.stats,
      },
    ]),
  );
};

const runSimpleSuite = async () => {
  const results = await createSuite()
    .add('Math.max', () => Math.max(1, 2))
    // @ts-expect-error - Allow testing simple setup
    // eslint-disable-next-line no-constant-binary-expression, @typescript-eslint/no-unnecessary-condition
    .add('Logical OR', () => 2 || 1)
    .run();

  console.log('Math.max vs || results');
  console.log(getResults(results.ungrouped ?? []));
};

const smallObject = { foo: 'bar', bar: 'baz', baz: 'quz' };

const array = new Array(10000);

for (let index = 0; index < array.length; index++) {
  array[index] = 1;
}

type LargeObject = Record<string, number>;

const largeObject = array.reduce<Record<string, number>>(
  (object: LargeObject, value: number, index: number): LargeObject => {
    object[`key_${index.toString()}`] = value;

    return object;
  },
  {},
);

const runComplexSuite = async () => {
  const results = await createSuite({
    minTime: 1000,
  })
    .add('for-in', 'small object', () => {
      const keys = [];

      for (const key in smallObject) {
        keys.push(key);
      }
    })
    .add('for-in', 'large object', () => {
      const keys = [];

      for (const key in largeObject) {
        keys.push(key);
      }
    })
    .add('Object.keys()', 'small object', () => {
      const _keys = Object.keys(smallObject);
    })
    .add('Object.keys()', 'large object', () => {
      const _keys = Object.keys(largeObject);
    })
    .run();

  for (const key in results) {
    const group = results[key];

    if (group) {
      console.log(`object compare results - ${key}`);
      console.log(getResults(group));
    } else {
      console.error(`No results found for ${key}.`);
    }
  }
};

const runSuites = async () => {
  await runSingleBenchmark();
  await runSimpleSuite();
  await runComplexSuite();
};

console.log('Running suite, please wait ...');

void runSuites();
