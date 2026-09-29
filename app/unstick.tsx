import { Platform } from "react-native"
import WebApp from "../components/web-app"
import UnstickScreen from "../screens/unstick/unstick"

export default function Unstick() {
  return Platform.OS === "web" ? <WebApp /> : <UnstickScreen />
}
