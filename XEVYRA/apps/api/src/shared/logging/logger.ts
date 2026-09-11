export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private static format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta ? { meta } : {}),
    };
    return JSON.stringify(entry);
  }

  public static info(message: string, meta?: Record<string, unknown>): void {
    console.log(Logger.format('info', message, meta));
  }

  public static warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(Logger.format('warn', message, meta));
  }

  public static error(message: string, meta?: Record<string, unknown>): void {
    console.error(Logger.format('error', message, meta));
  }

  public static debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.debug(Logger.format('debug', message, meta));
    }
  }
}
