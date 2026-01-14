/**
 * @saaskit/codegen
 *
 * Code generation for SaaSKit - generates typed DO subclasses and related code.
 *
 * @module @saaskit/codegen
 */

// DO Subclass Generator
export {
  generateDOSubclass,
  type DOGeneratorOptions
} from './generators/do-generator'

// Wrangler Config Generator
export {
  generateWranglerConfig,
  type WranglerGeneratorOptions
} from './generators/wrangler-generator'

// Worker Entry Point Generator
export {
  generateWorkerEntry,
  type WorkerGeneratorOptions
} from './generators/worker-generator'
