import { Platform } from "react-native"
import WebApp from "../components/web-app"
import MainScreen from "../screens/main-screen/main-screen"

export { RouteErrorBoundary as ErrorBoundary } from "../components/route-error-boundary/route-error-boundary"

export default function Index() {
  return Platform.OS === "web" ? <WebApp /> : <MainScreen />
}
