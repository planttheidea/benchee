declare namespace Benchee {
  export interface Defaults {
    delay?: number;
    minTime?: number;
    iterations?: number;
    type?: string;
  }

  export interface Test {
    fn: Function;
    group: string;
    iterations: number;
    name: string;
  }

  export interface TestGroup {
    [key: string]: Test[];
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
    name: string;
    stats: Stats;
  }

  export interface ResultGroup {
    [key: string]: Result[];
  }

  export interface GroupResults {
    group: string;
    results: Result[];
  }

  export interface Options extends Defaults {
    onComplete?: (results: ResultGroup) => void;
    onGroupComplete?: (results: GroupResults) => void;
    onGroupStart?: (group: string) => void;
    onResult?: (result: Result) => void;
  }

  export interface TestOptions {
    endTime?: number;
    iterations?: number;
    startTime?: number;
    test: Test;
  }
}
