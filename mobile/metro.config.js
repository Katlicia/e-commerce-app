const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Include shared/ folder in Metro's watch list
config.watchFolders = [workspaceRoot];

// Resolve @mobile/shared imports to ../shared
config.resolver.extraNodeModules = {
  "@mobile/shared": path.resolve(workspaceRoot, "shared"),
};

// When resolving imports from shared/, look in mobile/node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
