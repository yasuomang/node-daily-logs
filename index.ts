import * as winston from 'winston';
import 'winston-daily-rotate-file';

interface ExtendedLogger extends winston.Logger {
  track: (prefix?: string | number, message?: number | string) => void;
}

const logTypes = {
  INFO: 'info',
  ERROR: 'error',
} as const;

type LogTypeUnion = (typeof logTypes)[keyof typeof logTypes];

type LoggerTypeUnion = `${LogTypeUnion}Logger`;

const logDirectory = 'logs';

// 创建日志格式
const getBaseFormat = () =>
  winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, type }) => {
      return `${timestamp} [${level.toLocaleUpperCase()}] ${type}: ${message}`;
    })
  );

// 创建控制台的 transport
const getBaseConsole = () =>
  new winston.transports.Console({
    format: getBaseFormat(),
  });

// 创建日志文件的 transport
const getBaseTransport = (type: LogTypeUnion) =>
  new winston.transports.DailyRotateFile({
    dirname: `${logDirectory}/%DATE%`,
    filename: `${type}.log`,
    datePattern: 'YYYY-MM-DD',
  });

// 创建 logger
const getBaseLogger = (type: LogTypeUnion) => {
  let baseTransport = getBaseTransport(type);
  const logger = winston.createLogger({
    level: 'info',
    format: getBaseFormat(),
    transports: [baseTransport, getBaseConsole()],
  }) as ExtendedLogger;
  // 每天需要重新创建 transport
  baseTransport.on('rotate', () => {
    baseTransport = getBaseTransport(type);
  });
  // 添加 track 方法
  logger.track = (
    ...arg: [number | string | undefined, number | string | undefined]
  ) => {
    const length = arg.length;
    const prefix = length > 1 ? arg[0] : '';
    const message = length > 1 ? arg[1] : arg[0] || '';
    const formattedMessage = prefix ? `|${prefix}| ${message}` : `${message}`;
    logger.log({
      level: 'info',
      message: formattedMessage,
      type,
    });
  };
  return logger as ExtendedLogger;
};

const loggers: Record<LoggerTypeUnion, ExtendedLogger> = Object.values(
  logTypes
).reduce(
  (acc, type) => ({ ...acc, [`${type}Logger`]: getBaseLogger(type) }),
  {} as Record<LoggerTypeUnion, ExtendedLogger>
);

export const { infoLogger, errorLogger } = loggers;
