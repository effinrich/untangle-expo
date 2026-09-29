import Constants from "expo-constants"

export type ApiErrorKind = "offline" | "server" | "bad-response"

const FRIENDLY_MESSAGES: Record<ApiErrorKind, string> = {
  offline: "Can't reach Untangle right now. Check your connection and try again.",
  server: "Untangle hit a snag on its side. Try again in a moment.",
  "bad-response": "Untangle got an unexpected reply from the server. Try again in a moment.",
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, detail: string, status?: number) {
    super(FRIENDLY_MESSAGES[kind])
    this.name = "ApiError"
    this.kind = kind
    this.status = status
    this.cause = detail
  }
}

export function friendlyErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FRIENDLY_MESSAGES["bad-response"]
}

// Dev builds talk to the Expo dev server's API routes (app/api/*) on the machine running Metro;
// release builds require EXPO_PUBLIC_API_BASE_URL or app.json extra.apiBaseUrl.
function resolveApiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_BASE_URL
  if (override) return override.replace(/\/$/, "")

  const hostUri = Constants.expoConfig?.hostUri
  if (__DEV__ && hostUri) return `http://${hostUri.split("/")[0]}`

  const configured = Constants.expoConfig?.extra?.apiBaseUrl
  if (typeof configured === "string" && configured) return configured.replace(/\/$/, "")
  if (!__DEV__) {
    throw new Error("Set EXPO_PUBLIC_API_BASE_URL or app.json extra.apiBaseUrl for release builds.")
  }
  return ""
}

export const API_BASE_URL = resolveApiBaseUrl()

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })
  } catch (error) {
    throw new ApiError("offline", error instanceof Error ? error.message : String(error))
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!response.ok) {
    throw new ApiError("server", `${path} responded ${response.status}`, response.status)
  }
  if (!contentType.includes("application/json")) {
    throw new ApiError(
      "bad-response",
      `${path} returned ${contentType || "no content-type"} from ${response.url}`,
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    throw new ApiError("bad-response", error instanceof Error ? error.message : String(error))
  }
}
