import { Platform } from "react-native"
import WebApp from "../components/web-app"
import FocusScreen from "../screens/focus/focus"

export default function Focus() {
  return Platform.OS === "web" ? <WebApp /> : <FocusScreen />
}
