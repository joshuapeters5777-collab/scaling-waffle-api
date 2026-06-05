import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'scaling-waffle-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const base = `${timestamp} [${level}] ${message}`;
          return stack ? `${base}\n${stack}` : base;
        })
      )
    })
  ]
});

export const stream = {
  write: (message) => logger.info(message.trim())
};

export default logger;
