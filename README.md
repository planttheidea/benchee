# benchee

Simple benchmarks in both node and browser

## Table of contents

## Requirements

`benchee` requires that `Promise` is available globally. If using an environment that does not support it, you should polyfill prior to importing `benchee`.

## Usage

```javascript
import { benchmark, createSuite } from "benchee";

// the functions to benchmark
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

// create an individual benchmark
benchmark("add", () => add(1, 2)).then(results => console.log(results));

/*
{
  "stats": {
    "elapsed": 677,
    "endTime": 1540050973491,
    "startTime": 1540050972814,
    "iterations": 82165907,
    "ops": 121367661,
    "tpe": 0.00000823942708987561
  },
  "name": "add"
}
*/

// or create a suite of benchmarks
createSuite()
  .add("add", () => add(1, 2))
  .add("subtract", () => subtract(1, 2))
  .run()
  .then(results => console.log(results));

/*
{
  "ungrouped": [
    {
      "stats": {
        "elapsed": 802,
        "endTime": 1540050973617,
        "startTime": 1540050972815,
        "iterations": 28777534,
        "ops": 35882211,
        "tpe": 0.000027868961947886152
      },
      "name": "add"
    },
    {
      "stats": {
        "elapsed": 750,
        "endTime": 1540050974473,
        "startTime": 1540050973723,
        "iterations": 106326932,
        "ops": 141769242,
        "tpe": 0.000007053716174186235
      },
      "name": "subtract"
    }
  ]
}
*/
```

The contract is `Promise`-based, however you can also access the resulting data in a [callback format](#oncomplete).

## Benchmark groups

In addition to running standard benchmarks, you can group benchmarks together within the same suite. The results of each group can be accessed through the [`onGroupComplete` callback](#ongroupcomplete), and will namespaced under the group name in the final results.

To apply a group, simply add a group name as the second parameter to your test.

```javascript
createSuite()
  .add("add", "math", () => add(1, 2))
  .add("trim", "string", () => "  trimmed  ".trim())
  .run()
  .then(results => console.log(results));

/*
{
  "math": [
    {
      "stats": {
        "elapsed": 888,
        "endTime": 1540051045206,
        "startTime": 1540051044318,
        "iterations": 38415463,
        "ops": 43260656,
        "tpe": 0.000023115691720284616
      },
      "name": "add"
    }
  ],
  "string": [
    {
      "stats": {
        "elapsed": 568,
        "endTime": 1540051045880,
        "startTime": 1540051045312,
        "iterations": 15363261,
        "ops": 27047994,
        "tpe": 0.00003697131748266205
      },
      "name": "trim"
    }
  ]
}
*/
```

## Options

#### delay

The time wait between execution of benchmark [groups](#benchmark-groups) _(defaults to 100ms)_

#### minIterations

The minimum number of iterations that need to occur before the benchmark is considered complete _(defaults to 10)_

#### minTime

The minimum amount of time that needs to elapse before the benchmark is considered complete _(defaults to 500ms)_

**NOTE**: This is ignored when [`type`](#type) is set to `fixed`.

#### onComplete

Function called when suite has finished running. This is the callback method to receive results, if preferred over the standard promised-based method.

```javascript
onComplete: (results: Benchee.Results) => void;
```

#### onGroupComplete

Function called when a given [group](#benchmark-groups) has completed all of its benchmarks.

```javascript
onGroupComplete: (results: Benchee.ResultsGroup) => void;
```

#### onGroupStart

Function called when a given [group](#benchmark-groups) has started running its benchmarks.

```javascript
onGroupStart: (group: string) => void;
```

#### onResult

Function called when a specific benchmark has finished running.

```javascript
onResult: (result: Benchee.Result) => void;
```

#### type

The type of benchmark to perform. _(defaults to `adaptive`)_

Valid values:

- `adaptive` => number of iterations performed is based on an exponential algorithm driven by the `minTime`
- `fixed` => number of iterations performed is based directly on `minIterations`

## Support

#### Browser

- Chrome (33+)
- Edge (all)
- Firefox (29+)
- Opera (20+)
- Safari (7.1+)

**NOTE**: If a `Promise` polyfill is provided, then older versions / unlisted browsers should be supported as well (notably IE11).

#### Node

- 6+

## Development

Standard stuff, clone the repo and `npm install` dependencies. The npm scripts available:

- `build` => run rollup to build the distributed files in `dist`
- `clean` => run `rimraf` on the `dist` folder
- `dev` => run webpack dev server to run example app (playground!)
- `dist` => runs `clean`, `build`, and `build:types`
- `lint` => runs TSLint against all files in the `src` folder
- `lint:fix` => runs `lint`, fixing any errors if possible
- `prepublish` => runs `prepublish:compile`
- `prepublish:compile` => run `lint`, `test:coverage`, and `dist`
- `test` => run AVA test functions with `NODE_ENV=test`
- `test:coverage` => run `test` but with `nyc` for coverage checker
- `test:watch` => run `test`, but with persistent watcher
