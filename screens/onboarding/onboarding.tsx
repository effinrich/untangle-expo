import React, { useRef } from "react"
import { ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowRight } from "../../theme/icons"
import { Button } from "../../components/button/button"
import { useAppState } from "../../hooks/app-context"
import { PAGES } from "./consts"
import { useOnboardingPager } from "./hooks"
import { OnboardingDots } from "./partials/onboarding-dots"
import { OnboardingPage } from "./partials/onboarding-page"

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { completeOnboarding, signIn, canSignIn } = useAppState()
  const scrollRef = useRef<ScrollView>(null)
  const pager = useOnboardingPager(scrollRef)

  const finish = (withSignIn: boolean) => {
    completeOnboarding()
    if (withSignIn) signIn()
    router.replace("/")
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }}>
      <View className="flex-row justify-end px-4 min-h-control">
        {!pager.isLast ? (
          <Button
            label="Skip"
            variant="ghost"
            accessibilityHint="Skips the intro and opens Untangle"
            onPress={() => finish(false)}
          />
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={pager.onMomentumScrollEnd}
        className="flex-1"
      >
        {PAGES.map((page, i) => (
          <OnboardingPage
            key={page.id}
            icon={page.icon}
            title={page.title}
            body={page.body}
            width={pager.width}
            active={i === pager.index}
          />
        ))}
      </ScrollView>

      <View className="px-4 gap-3">
        <OnboardingDots count={PAGES.length} index={pager.index} />
        {pager.isLast ? (
          <>
            <Button label="Start as guest" size="lg" onPress={() => finish(false)} />
            <Button
              label="Sign in with Google"
              variant="secondary"
              size="lg"
              disabled={!canSignIn}
              accessibilityHint="Syncs your steps across devices"
              onPress={() => finish(true)}
            />
          </>
        ) : (
          <Button label="Next" icon={ArrowRight} size="lg" onPress={pager.next} />
        )}
      </View>
    </View>
  )
}
