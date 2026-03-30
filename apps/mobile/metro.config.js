const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Redirect expo/AppEntry.js's `../../App` import to our local App.tsx.
// Expo is hoisted to monorepo root node_modules, so ../../App misses our project.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Catch the ../../App import from AppEntry.js regardless of hoisting location
  if (
    moduleName === '../../App' ||
    (moduleName.endsWith('/App') && context.originModulePath.includes('expo'))
  ) {
    const appPath = path.resolve(projectRoot, 'App.tsx');
    return { filePath: appPath, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
