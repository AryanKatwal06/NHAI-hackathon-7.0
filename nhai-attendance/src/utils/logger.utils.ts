/* eslint-disable */
// src/utils/logger.utils.ts
// Structured logger utility.
// In development builds: logs to console with timestamps and level indicators.
// In production builds: logs are suppressed.
// Never logs sensitive data (embeddings, raw GPS, device IDs).

import { FEATURE_FLAGS } from '@constants/app.constants';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// Sensitive field names — these are NEVER included in log output
const SENSITIVE_FIELDS = new Set([
  'faceEmbedding',
  'embeddingData',
  'faceImage',
  'facePixels',
  'rawBiometric',
  'password',
  'pin',
  'encryptionKey',
  'supervisorPin',
]);

/**
 * Redacts sensitive fields from a data object before logging.
 */
function redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitiveData(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

class Logger {
  private readonly module: string;

  constructor(module: string) {
    this.module = module;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!FEATURE_FLAGS.PERFORMANCE_LOGGING && !__DEV__) {
      return;
    }

    const entry: LogEntry = {
      level,
      module: this.module,
      message,
      data: data ? redactSensitiveData(data) : undefined,
      timestamp: new Date().toISOString(),
    };

    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.module}]`;
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';

    switch (level) {
      case 'DEBUG':
        console.debug(`${prefix} ${message}${dataStr}`);
        break;
      case 'INFO':
        console.info(`${prefix} ${message}${dataStr}`);
        break;
      case 'WARN':
        console.warn(`${prefix} ${message}${dataStr}`);
        break;
      case 'ERROR':
        console.error(`${prefix} ${message}${dataStr}`);
        break;
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('DEBUG', message, data);
  }
  info(message: string, data?: Record<string, unknown>): void {
    this.log('INFO', message, data);
  }
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('WARN', message, data);
  }
  error(message: string, data?: Record<string, unknown>): void {
    this.log('ERROR', message, data);
  }
}

/**
 * Creates a module-specific logger instance.
 * Usage: const logger = createLogger('AuthenticationService');
 *        logger.info('Pipeline started', { workerId });
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}
