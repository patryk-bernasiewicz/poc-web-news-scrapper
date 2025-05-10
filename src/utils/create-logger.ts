'use server';

import { format } from 'date-fns';
import path from 'node:path';
import {
  createLogger as createWinstonLogger,
  transports,
  format as winstonFormat,
} from 'winston';

const getLogPath = (name: string) => {
  const now = Date.now();
  const formattedDate = format(now, 'yyyy-MM-dd_HH-mm-ss');
  return path.join(process.cwd(), 'logs', `${name}-${formattedDate}.log`);
};

export const createLogger = (name: string) => {
  const logPath = getLogPath(name);
  const logger = createWinstonLogger({
    level: 'silly',
    format: winstonFormat.combine(
      winstonFormat.timestamp(),
      winstonFormat.json(),
    ),
    transports: [new transports.File({ filename: logPath })],
  });

  return logger;
};
