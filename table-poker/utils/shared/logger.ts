import { logger as rnLogger, consoleTransport } from 'react-native-logs';
import * as Device from 'expo-device';

// Get device name
const deviceName = Device.deviceName || Device.modelName || 'Unknown';

// Disabled extensions configuration
const disabledExtensions: string[] = ['webrtc'];

// Custom transport with formatted output
const customTransport = (props: any) => {
  const { msg, level, options, extension } = props;

  // Skip logging if extension is disabled (extension is a string, not an object)
  if (extension && disabledExtensions.includes(extension)) {
    return;
  }

  // Format timestamp as HH:MM:SS
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${hours}:${minutes}:${seconds}`;

  // Format message with extension label if present (extension is a string)
  const extensionLabel = extension ? `[${extension}] ` : '';
  const message = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  const formattedMessage = `${timestamp} [${deviceName}] ${extensionLabel}${level.text.toUpperCase()} | ${message}`;

  // Output to console
  const consoleMethod = (console as any)[level.text] || console.log;
  consoleMethod(formattedMessage);
};

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
  extensionColors: {
    webrtc: 'blue',
  },
};

export const logger = rnLogger.createLogger(config);
export const webrtcLogger = logger.extend('webrtc');
