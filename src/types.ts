export type BenchmarkFn = () => void;

export interface DefaultOptions {
  delay?: number;
  minIterations?: number;
  minTime?: number;
  type?: string;
}

export interface Benchmark<N extends string = string> {
  fn: BenchmarkFn;
  group: string;
  iterations: number;
  name: N;
}

export type BenchmarkGroup = Record<string, Benchmark[]>;

export interface Stats {
  elapsed: number;
  endTime: number;
  iterations: number;
  ops: number;
  tpe: number;
  startTime: number;
}

export interface Result<N extends string = string> {
  error: Error | null;
  name: N;
  stats: Stats;
}

export interface ResultsGroup<N extends string = string> {
  group: N;
  results: Result[];
}

export type Results<N extends string = string> = Record<N, Result[]>;

interface SuiteRunnerOptions {
  onComplete?: (results: Results) => void;
  onGroupComplete?: (resultGroup: ResultsGroup) => void;
  onGroupStart?: (group: string) => void;
  onResult?: (result: Result) => void;
}

interface BenchmarkRunnerOptions<N extends string> {
  onComplete?: (result: Result<N>) => void;
}

export interface SuiteOptions extends DefaultOptions, SuiteRunnerOptions {}
export interface NormalizedSuiteOptions extends Required<DefaultOptions>, SuiteRunnerOptions {}

export interface BenchmarkOptions<N extends string> extends DefaultOptions, BenchmarkRunnerOptions<N> {}
export interface NormalizedBenchmarkOptions<N extends string>
  extends Required<DefaultOptions>, BenchmarkRunnerOptions<N> {}

export interface RunBenchmarkOptions {
  benchmark: Benchmark;
  endTime?: number;
  iterations?: number;
  startTime?: number;
}

export interface BencheeSuite {
  benchmarks: BenchmarkGroup;
  isRunning: boolean;
  options: SuiteOptions;
  results: Results;
}
