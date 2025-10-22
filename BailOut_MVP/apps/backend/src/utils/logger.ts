import winston from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey'
};

// Tell winston that you want to link the colors
winston.addColors(logColors);

// Define the format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

// Define the format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [];

// Always add console transport in development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Add console transport for production but only for errors and warnings
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'warn'
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: fileFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create a stream object for Morgan HTTP request logging
export const morganStream = {
  write: (message: string) => {
    // Remove the newline at the end
    logger.http(message.trim());
  }
};

// Helper functions for structured logging
export class Logger {
  /**
   * Log authentication events
   */
  static auth(action: string, metadata: any = {}) {
    logger.info(`AUTH: ${action}`, {
      ...metadata,
      category: 'auth',
      action
    });
  }

  /**
   * Log API requests
   */
  static api(method: string, path: string, statusCode: number, responseTime: number, metadata: any = {}) {
    logger.http(`${method} ${path} ${statusCode}`, {
      ...metadata,
      category: 'api',
      method,
      path,
      statusCode,
      responseTime
    });
  }

  /**
   * Log database operations
   */
  static database(operation: string, table: string, metadata: any = {}) {
    logger.debug(`DB: ${operation} on ${table}`, {
      ...metadata,
      category: 'database',
      operation,
      table
    });
  }

  /**
   * Log external service calls
   */
  static external(service: string, operation: string, metadata: any = {}) {
    logger.info(`EXTERNAL: ${service} - ${operation}`, {
      ...metadata,
      category: 'external',
      service,
      operation
    });
  }

  /**
   * Log security events
   */
  static security(event: string, metadata: any = {}) {
    logger.warn(`SECURITY: ${event}`, {
      ...metadata,
      category: 'security',
      event
    });
  }

  /**
   * Log business logic events
   */
  static business(event: string, metadata: any = {}) {
    logger.info(`BUSINESS: ${event}`, {
      ...metadata,
      category: 'business',
      event
    });
  }

  /**
   * Log performance metrics
   */
  static performance(metric: string, value: number, unit: string, metadata: any = {}) {
    logger.info(`PERFORMANCE: ${metric}`, {
      ...metadata,
      category: 'performance',
      metric,
      value,
      unit
    });
  }

  /**
   * Log errors with context
   */
  static error(message: string, error: Error, metadata: any = {}) {
    logger.error(message, {
      ...metadata,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }

  /**
   * Log user actions
   */
  static userAction(userId: string, action: string, metadata: any = {}) {
    logger.info(`USER ACTION: ${action}`, {
      ...metadata,
      category: 'user_action',
      userId,
      action
    });
  }

  /**
   * Log rate limiting events
   */
  static rateLimit(identifier: string, limit: number, current: number, metadata: any = {}) {
    logger.warn(`RATE LIMIT: ${identifier}`, {
      ...metadata,
      category: 'rate_limit',
      identifier,
      limit,
      current
    });
  }

  /**
   * Log health check results
   */
  static health(service: string, status: 'healthy' | 'unhealthy', metadata: any = {}) {
    const level = status === 'healthy' ? 'info' : 'error';
    logger.log(level, `HEALTH: ${service} is ${status}`, {
      ...metadata,
      category: 'health',
      service,
      status
    });
  }
}

// Middleware for request logging
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    Logger.api(method, originalUrl, statusCode, duration, {
      ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId
    });
  });

  next();
}

// Function to safely log sensitive data (removes/masks sensitive fields)
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'phoneNumber',
    'email',
    'ssn',
    'creditCard'
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      if (typeof sanitized[field] === 'string') {
        // Show only first few characters
        const value = sanitized[field];
        sanitized[field] = value.length > 5 ? value.slice(0, 3) + '*'.repeat(value.length - 3) : '***';
      } else {
        sanitized[field] = '[REDACTED]';
      }
    }
  }

  return sanitized;
}

export default logger;