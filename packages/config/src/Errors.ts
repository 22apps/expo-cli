import { ConfigErrorCode } from './Config.types';

/**
 * Based on `JsonFileError` from `@expo/json-file`
 */
export class ConfigError extends Error {
  readonly name = 'ConfigError';
  readonly isConfigError = true;

  constructor(message: string, public code: ConfigErrorCode, public cause?: Error) {
    super(cause ? `${message}\nāā Cause: ${cause.name}: ${cause.message}` : message);
  }
}
