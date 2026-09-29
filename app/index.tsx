import { Platform } from "react-native"
import WebApp from "../components/web-app"
import MainScreen from "../screens/main-screen/main-screen"

export default function Index() {
  return Platform.OS === "web" ? <WebApp /> : <MainScreen />
}
