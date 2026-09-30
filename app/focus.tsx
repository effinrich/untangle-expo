import { Platform } from "react-native"
import WebApp from "../components/web-app"
import FocusScreen from "../screens/focus/focus"

export { RouteErrorBoundary as ErrorBoundary } from "../components/route-error-boundary/route-error-boundary"

export default function Focus() {
  return Platform.OS === "web" ? <WebApp /> : <FocusScreen />
}
