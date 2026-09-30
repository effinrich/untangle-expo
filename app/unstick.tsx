import { Platform } from "react-native"
import WebApp from "../components/web-app"
import UnstickScreen from "../screens/unstick/unstick"

export { RouteErrorBoundary as ErrorBoundary } from "../components/route-error-boundary/route-error-boundary"

export default function Unstick() {
  return Platform.OS === "web" ? <WebApp /> : <UnstickScreen />
}
