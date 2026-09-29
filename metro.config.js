const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = withNativeWind(getDefaultConfig(__dirname), { input: "./global.css" })

// Web renders the DOM app (Tailwind v4, cascade layers); NativeWind's unlayered v3 CSS would override it.
const resolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName.endsWith("/global.css")) return { type: "empty" }
  return (resolveRequest ?? context.resolveRequest)(context, moduleName, platform)
}

module.exports = config
