import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { ErrorBoundaryFallback } from "./partials/error-boundary-fallback"

interface ErrorBoundaryProps {
  children: ReactNode
  /** Replaces the default fallback; receives the thrown error and a reset. */
  fallback?: (context: { error: Error; reset: () => void }) => ReactNode
  /** When any value changes, a caught error is cleared so step or view changes recover on their own. */
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  error: Error | null
  prevResetKeys?: unknown[]
}

function resetKeysChanged(previous: unknown[] | undefined, next: unknown[] | undefined) {
  if (!previous || !next) return previous !== next
  if (previous.length !== next.length) return true
  return next.some((key, index) => key !== previous[index])
}

// Catches render-time crashes in its subtree so one broken feature cannot take the page down.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, prevResetKeys: props.resetKeys }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  // Clearing a caught error when resetKeys change happens during render, the pattern React
  // recommends over setting state in componentDidUpdate.
  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (!resetKeysChanged(state.prevResetKeys, props.resetKeys)) return null
    if (state.error) return { error: null, prevResetKeys: props.resetKeys }
    return { prevResetKeys: props.resetKeys }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Untangle render error:", error, info.componentStack)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset })
    return <ErrorBoundaryFallback error={error} onReset={this.reset} />
  }
}
