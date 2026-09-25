import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function UnstickScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState('Paralyzed / cannot pick where to start');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    chosenTask: string;
    reasoning: string;
    sparkChallenge: string;
  } | null>(null);

  const moods = [
    'Paralyzed / cannot pick where to start',
    'Brain is completely fried (0% battery)',
    'Restless, distracted, opening 15 tabs',
    'Dreading a high-stakes thing',
  ];

  const handlePickForMe = () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      setResult({
        chosenTask: 'Clear 3 empty coffee mugs off desk',
        reasoning:
          'This has zero cognitive resistance and immediately clears visual noise in your physical field.',
        sparkChallenge:
          'Pick up the blue mug by your monitor for literally 60 seconds. If you still hate it after 60s, you have 100% permission to quit.',
      });
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 900);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-950 px-6 pt-12 pb-10">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-amber-400 font-bold text-xs uppercase tracking-wider">
          ⚡ EXECUTIVE DYSFUNCTION RESET
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800"
        >
          <Text className="text-xs text-neutral-300">Close</Text>
        </Pressable>
      </View>

      {!result ? (
        <View>
          <Text className="text-2xl font-bold text-neutral-100 mb-2">
            Remove Decision Fatigue
          </Text>
          <Text className="text-xs text-neutral-400 mb-6 leading-relaxed">
            When executive paralysis hits, deciding burns all your dopamine. Let AI pick the lowest
            barrier entry point.
          </Text>

          <Text className="text-xs font-semibold text-neutral-300 mb-2">
            How does your brain feel right now?
          </Text>

          {moods.map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setSelectedMood(m);
                Haptics.selectionAsync();
              }}
              className={`p-3.5 rounded-xl border mb-2.5 ${
                selectedMood === m
                  ? 'bg-amber-400/15 border-amber-400'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedMood === m ? 'text-amber-300' : 'text-neutral-300'
                }`}
              >
                {m}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={handlePickForMe}
            disabled={isLoading}
            className="bg-amber-400 py-3.5 rounded-2xl items-center mt-6 active:scale-95"
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-sm font-bold text-black">
                ✨ Pick The Single Easiest Spark
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Selected For You:
            </Text>
            <Text className="text-lg font-bold text-neutral-100 mt-1">
              {result.chosenTask}
            </Text>
            <Text className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {result.reasoning}
            </Text>
          </View>

          <View className="bg-amber-400/10 p-4 rounded-2xl border border-amber-400/30">
            <Text className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              The 2-Minute Spark Contract:
            </Text>
            <Text className="text-xs font-medium text-neutral-200 mt-1 leading-relaxed">
              "{result.sparkChallenge}"
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="bg-amber-400 py-3.5 rounded-2xl items-center mt-4 active:scale-95"
          >
            <Text className="text-sm font-bold text-black">Accept & Start Spark</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
