import type { DefaultOptions } from './types.js';

/**
 * @constant DEFAULT_OPTIONS the default options
 */
export const DEFAULT_OPTIONS: Required<DefaultOptions> = {
  delay: 100,
  minIterations: 10,
  minTime: 500,
  type: 'adaptive',
};

/**
 * @constant UNGROUPED_NAME the name of the ungrouped section
 */
export const UNGROUPED_NAME = 'ungrouped';
