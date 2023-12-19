import pino from 'pino';
import dayjs from 'dayjs';
import { join } from 'node:path';
import { accessSync, constants, mkdirSync } from 'node:fs';
import appConfig from './appConfig.js';

const logFilename = `${dayjs().format('YYYY-MM-DDTHHmmss')}.log`;
const baseLogdir = join(appConfig.cwd, 'logs');
const logFileAndPath = join(baseLogdir, logFilename);
try {
  accessSync(baseLogdir, constants.F_OK);
} catch (err) {
  const result = mkdirSync(baseLogdir, { recursive: true });
  if (!result)
    throw new Error(`Issue createding log directory at ${baseLogdir}`);
}

const pinoDest = pino.destination({
  dest: logFileAndPath,
});

export const logger = pino(
  {
    base: null,
    formatters: {
      level: label => ({ level: label.toUpperCase() }),
    },
  },
  pinoDest,
);
