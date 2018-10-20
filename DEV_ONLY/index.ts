// external dependencies
const Table = require('cli-table2');

// src
import { createSuite, test } from '../src';

const getResults = (results: Benchee.Result[]): string => {
  const table = new Table({
    head: ['Name', 'Ops / sec'],
  });

  results.forEach(({ name, stats }) => {
    table.push([name, stats.ops.toLocaleString()]);
  });

  return table.toString();
};

const sum = (a: number, b: number): number => a + b;

const runBasicSuite = async () => {
  const results = await test('basic sum', () => sum(1, 2));

  console.log('basic sum results');
  console.log(getResults([
    {
      name: 'sum',
      stats: results.stats
    }
  ]));
};

const smallObject = { foo: 'bar', bar: 'baz', baz: 'quz' };

const array = new Array(10000);

for (let index = 0; index < array.length; index++) {
  array[index] = 1;
}

interface LargeObject {
  [key: string]: number;
}

const largeObject = array.reduce((object: LargeObject, value: number, index: number): LargeObject => {
  object[`key_${index}`] = value;

  return object;
}, {});

const runComplexSuite = async () => {
  const results = await createSuite({
    minTime: 1000,
  })
    .add('for-in', 'small object', () => {
      const keys = [];

      for (let key in smallObject) {
        keys.push(key);
      }
    })
    .add('for-in', 'large object', () => {
      const keys = [];

      for (let key in largeObject) {
        keys.push(key);
      }
    })
    .add('Object.keys()', 'small object', () => {
      const keys = Object.keys(smallObject);
    })
    .add('Object.keys()', 'large object', () => {
      const keys = Object.keys(largeObject);
    })
    .run();

  for (let key in results) {
    const group = results[key];

    console.log(`object compare results - ${key}`);
    console.log(getResults(group));
  }
};

const runSuites = async () => {
  await runBasicSuite();
  await runComplexSuite();
}

runSuites();

document.body.style.backgroundColor = "#1d1d1d";
document.body.style.color = "#d5d5d5";
document.body.style.margin = "0";
document.body.style.padding = "0";

const div = document.createElement("div");

div.textContent = "Check the console for details.";

document.body.appendChild(div);
