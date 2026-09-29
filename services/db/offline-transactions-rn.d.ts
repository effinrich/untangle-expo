// Metro runs with package exports disabled, so the react-native subpath is imported by file.
declare module "@tanstack/offline-transactions/dist/cjs/connectivity/ReactNativeOnlineDetector.cjs" {
  export { ReactNativeOnlineDetector } from "@tanstack/offline-transactions/react-native"
}
