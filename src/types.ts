declare namespace Benchee {
  export interface DefaultOptions {
    delay?: number;
    minIterations?: number;
    minTime?: number;
    type?: string;
  }

  export interface Benchmark {
    fn: Function;
    group: string;
    iterations: number;
    name: string;
  }

  export interface BenchmarkGroup {
    [key: string]: Benchmark[];
  }

  export interface Stats {
    elapsed: number;
    endTime: number;
    iterations: number;
    ops: number;
    tpe: number;
    startTime: number;
  }

  export interface Result {
    error: Error | null;
    name: string;
    stats: Stats;
  }

  export interface ResultsGroup {
    group: string;
    results: Result[];
  }

  export interface Results {
    [group: string]: Result[];
  }

  export interface Options extends DefaultOptions {
    onComplete?: (results: Results) => void;
    onGroupComplete?: (resultGroup: ResultsGroup) => void;
    onGroupStart?: (group: string) => void;
    onResult?: (result: Result) => void;
  }

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
}
