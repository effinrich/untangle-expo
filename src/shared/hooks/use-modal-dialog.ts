import { useEffect, useRef } from "react"

// Opens a native <dialog> with showModal() on mount, so the browser provides the focus trap,
// the inert background, Escape handling, and focus restored to the trigger on close.
export function useModalDialog<T extends HTMLDialogElement>(isOpen: boolean) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!isOpen || !dialog) return
    const restoreFocus = document.activeElement as HTMLElement | null
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      if (restoreFocus && document.contains(restoreFocus)) restoreFocus.focus()
    }
  }, [isOpen])

  return ref
}
