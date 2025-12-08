type BenchmarkFn = () => void;
interface DefaultOptions {
  delay?: number;
  minIterations?: number;
  minTime?: number;
  type?: string;
}
interface Benchmark<N extends string = string> {
  fn: BenchmarkFn;
  group: string;
  iterations: number;
  name: N;
}
type BenchmarkGroup = Record<string, Benchmark[]>;
interface Stats {
  elapsed: number;
  endTime: number;
  iterations: number;
  ops: number;
  tpe: number;
  startTime: number;
}
interface Result<N extends string = string> {
  error: Error | null;
  name: N;
  stats: Stats;
}
interface ResultsGroup<N extends string = string> {
  group: N;
  results: Result[];
}
type Results = Record<string, Result[]>;
interface RunnerOptions {
  onComplete?: (results: Results) => void;
  onGroupComplete?: (resultGroup: ResultsGroup) => void;
  onGroupStart?: (group: string) => void;
  onResult?: (result: Result) => void;
}
interface Options extends DefaultOptions, RunnerOptions {}
interface NormalizedOptions extends Required<DefaultOptions>, RunnerOptions {}
interface BenchmarkOptions {
  benchmark: Benchmark;
  endTime?: number;
  iterations?: number;
  startTime?: number;
}

declare class BencheeSuite implements BencheeSuite {
  benchmarks: BenchmarkGroup;
  isRunning: boolean;
  options: NormalizedOptions;
  results: Results;
  constructor(passedOptions?: Options);
  /**
   * when a benchmark finishes, store the result
   */
  _onResult<const B extends Benchmark>(benchmark: B, error: Error | null, stats: Stats): void;
  /**
   * run the benchmark with the options passed
   */
  _runBenchmark(benchmarkOptions: BenchmarkOptions): Promise<void>;
  /**
   * execute the runs for the benchmarked function
   */
  _runBenchmarkIterations(benchmark: Benchmark, runs: number): void;
  /**
   * run a group of benchmarks
   */
  _runGroup(groupBenchmarks: Benchmark[], group?: string): Promise<void>;
  /**
   * add a benchmark to the queue to be run
   */
  add(name: string, benchmarkGroup: string | ((...args: any[]) => any), benchmarkFn?: (...args: any[]) => any): this;
  /**
   * run the benchmarks in the queue
   */
  run(): Promise<Results>;
}

/**
 * create a new benchee suite
 * @param passedOptions the options to create the suite with
 * @returns the new benchee suite
 */
declare const createSuite: (passedOptions?: Options) => BencheeSuite;
/**
 * benchmark one thing standalone, outside of a given suite
 * @param name the name of the test
 * @param fn the test function
 */
declare const benchmark: (name: string, fn: BenchmarkFn) => Promise<Result>;

export { benchmark, createSuite };
