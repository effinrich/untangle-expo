import { Platform } from "react-native"
import WebApp from "../components/web-app"
import OnboardingScreen from "../screens/onboarding/onboarding"

export { RouteErrorBoundary as ErrorBoundary } from "../components/route-error-boundary/route-error-boundary"

export default function Onboarding() {
  return Platform.OS === "web" ? <WebApp /> : <OnboardingScreen />
}
