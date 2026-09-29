import { Platform } from "react-native"
import * as FileSystem from "expo-file-system"

export async function readAudioAsBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const response = await fetch(uri)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        if (typeof dataUrl === "string") {
          resolve(dataUrl.split(",")[1])
        } else {
          reject(new Error("Invalid read result"))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
}
