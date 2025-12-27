const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  assert: require.resolve('assert'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process'),
};

// Custom resolver to redirect crypto imports to our shim
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Log to verify this is being called
  if (moduleName === 'crypto' || moduleName === 'crypto-browserify') {
    console.log(`[METRO RESOLVER] Intercepting: ${moduleName}`);
  }

  if (moduleName === 'crypto') {
    console.log('[METRO RESOLVER] Redirecting crypto to our shim');
    return {
      filePath: path.resolve(__dirname, 'polyfills/crypto-shim.js'),
      type: 'sourceFile',
    };
  }

  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
