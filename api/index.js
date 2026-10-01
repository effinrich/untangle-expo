// Vercel server entry. Every request (SSR pages and the /api/* server routes)
// delegates through @expo/server's Vercel adapter, which runs in the Node
// runtime. Expo's docs: docs.expo.dev/router/web/api-routes#vercel
const path = require("path")
const { createRequestHandler } = require("@expo/server/adapter/vercel")

module.exports = createRequestHandler({
  build: path.join(__dirname, "../dist/server"),
})
