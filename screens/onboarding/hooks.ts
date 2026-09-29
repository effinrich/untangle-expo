import { RefObject, useState } from "react"
import {
  AccessibilityInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
} from "react-native"
import { useReducedMotion } from "react-native-reanimated"
import { PAGES } from "./consts"

export function useOnboardingPager(scrollRef: RefObject<ScrollView>) {
  const { width } = useWindowDimensions()
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  const announce = (next: number) =>
    AccessibilityInfo.announceForAccessibility(
      `Page ${next + 1} of ${PAGES.length}: ${PAGES[next].title}`,
    )

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: !reduceMotion })
    setIndex(next)
    announce(next)
  }

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width)
    if (next !== index) {
      setIndex(next)
      announce(next)
    }
  }

  return {
    width,
    index,
    isLast: index === PAGES.length - 1,
    next: () => goTo(Math.min(index + 1, PAGES.length - 1)),
    onMomentumScrollEnd,
  }
}
