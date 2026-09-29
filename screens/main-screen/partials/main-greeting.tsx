import React from "react"
import { Text } from "react-native"
import { Greeting } from "../types"

interface MainGreetingProps {
  greeting: Greeting
  openCount: number
}

export function MainGreeting({ greeting, openCount }: MainGreetingProps) {
  switch (greeting) {
    case null:
      return null
    case "first-run":
      return (
        <Text className="text-callout text-text-secondary -mt-2">
          Here are a few examples to try. Start one, or delete them and dump your own.
        </Text>
      )
    case "returning":
      return (
        <Text className="text-callout text-text-secondary -mt-2">
          Welcome back. {openCount} {openCount === 1 ? "step is" : "steps are"} waiting when you’re
          ready.
        </Text>
      )
    default: {
      const unhandled: never = greeting
      return unhandled
    }
  }
}
