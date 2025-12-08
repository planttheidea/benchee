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

export type Results = Record<string, Result[]>;

interface RunnerOptions {
  onComplete?: (results: Results) => void;
  onGroupComplete?: (resultGroup: ResultsGroup) => void;
  onGroupStart?: (group: string) => void;
  onResult?: (result: Result) => void;
}

export interface Options extends DefaultOptions, RunnerOptions {}
export interface NormalizedOptions extends Required<DefaultOptions>, RunnerOptions {}

export interface BenchmarkOptions {
  benchmark: Benchmark;
  endTime?: number;
  iterations?: number;
  startTime?: number;
}

export interface BencheeSuite {
  benchmarks: BenchmarkGroup;
  isRunning: boolean;
  options: Options;
  results: Results;
}
