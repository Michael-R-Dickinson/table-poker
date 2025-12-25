import {
  logger as rnLogger,
  consoleTransport,
  fileAsyncTransport,
} from 'react-native-logs';
import { Paths, File } from 'expo-file-system';
import * as Device from 'expo-device';

// Use new expo-file-system API
const logFile = new File(Paths.document, 'app.log');
const LOG_FILE_PATH = logFile.uri;

// Get device name
const deviceName = Device.deviceName || Device.modelName || 'Unknown';

// Format timestamp as HH:MM:SS
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Custom log formatter
const formatLog = (level: string, message: any) => {
  const timestamp = formatTime(new Date());
  const msg = typeof message === 'object' ? JSON.stringify(message) : message;
  return `${timestamp} [${deviceName}] ${level.toUpperCase()} | ${msg}`;
};

// Custom transport that combines console and file logging with custom formatting
const customTransport = (props: any) => {
  const { msg, level } = props;
  const formattedMessage = formatLog(level.text, msg);

  // Console output
  const consoleMethod = (console as any)[level.text] || console.log;
  consoleMethod(formattedMessage);

  // File output
  fileAsyncTransport({
    ...props,
    msg: formattedMessage,
    options: {
      filePath: LOG_FILE_PATH,
    },
  });
};

// Clear log file on app start
const clearLogFile = async () => {
  try {
    if (logFile.exists) {
      await logFile.delete();
    }
  } catch (error) {
    console.error('Failed to clear log file:', error);
  }
};

// Initialize log file clearing
clearLogFile();

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: customTransport,
  printLevel: false,
  printDate: false,
  enabled: true,
};

export const logger = rnLogger.createLogger(config);

// Export log file path for potential debugging/viewing
export { LOG_FILE_PATH };
