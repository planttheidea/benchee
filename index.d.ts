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
type Results<N extends string = string> = Record<N, Result[]>;
interface SuiteRunnerOptions {
  onComplete?: (results: Results) => void;
  onGroupComplete?: (resultGroup: ResultsGroup) => void;
  onGroupStart?: (group: string) => void;
  onResult?: (result: Result) => void;
}
interface BenchmarkRunnerOptions<N extends string> {
  onComplete?: (result: Result<N>) => void;
}
interface SuiteOptions extends DefaultOptions, SuiteRunnerOptions {}
interface NormalizedSuiteOptions extends Required<DefaultOptions>, SuiteRunnerOptions {}
interface BenchmarkOptions<N extends string> extends DefaultOptions, BenchmarkRunnerOptions<N> {}
interface RunBenchmarkOptions {
  benchmark: Benchmark;
  endTime?: number;
  iterations?: number;
  startTime?: number;
}

declare class BencheeSuite implements BencheeSuite {
  benchmarks: BenchmarkGroup;
  isRunning: boolean;
  options: NormalizedSuiteOptions;
  results: Results;
  constructor(passedOptions?: SuiteOptions);
  /**
   * When a benchmark finishes, store the result.
   */
  _onResult<const B extends Benchmark>(benchmark: B, error: Error | null, stats: Stats): void;
  /**
   * run the benchmark with the options passed
   */
  _runBenchmark(benchmarkOptions: RunBenchmarkOptions): Promise<void>;
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
 * Create a new benchee suite.
 */
declare const createSuite: (passedOptions?: SuiteOptions) => BencheeSuite;
/**
 * Benchmark one function standalone, outside the context of a suite.
 */
declare function benchmark<N extends string>(
  name: N,
  fn: BenchmarkFn,
  options?: BenchmarkOptions<N>,
): Promise<Result<N>>;

export { benchmark, createSuite };
