import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function FocusScreen() {
  const router = useRouter();
  const { title, firstStep, minutes } = useLocalSearchParams<{
    id: string;
    title: string;
    firstStep: string;
    minutes: string;
  }>();

  const totalSeconds = (parseInt(minutes || '10', 10) || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [parkingThought, setParkingThought] = useState('');
  const [parkingLot, setParkingLot] = useState<string[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleParkThought = () => {
    if (!parkingThought.trim()) return;
    setParkingLot((prev) => [parkingThought.trim(), ...prev]);
    setParkingThought('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-950 px-6 pt-12 pb-8">
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-amber-400 font-bold text-xs uppercase tracking-wider">
          ⚡ ONE THING RADAR
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800"
        >
          <Text className="text-xs text-neutral-300">Exit</Text>
        </Pressable>
      </View>

      {/* Task Heading */}
      <Text className="text-2xl font-extrabold text-neutral-100 text-center leading-tight mb-4">
        {title || 'Current Micro-Action'}
      </Text>

      {/* The Physical Trigger Spark */}
      <View className="bg-neutral-900/90 p-4 rounded-2xl border border-amber-500/30 mb-8">
        <Text className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
          First Physical Action:
        </Text>
        <Text className="text-sm font-medium text-neutral-200 leading-relaxed">
          {firstStep || 'Open the app or document'}
        </Text>
      </View>

      {/* Large Timer */}
      <View className="items-center my-6">
        <Text className="text-7xl font-mono font-extrabold text-neutral-100 tracking-tight">
          {timeFormatted}
        </Text>
        <Text className="text-xs text-neutral-500 mt-2">Zero distraction sprint</Text>
      </View>

      {/* Play / Pause */}
      <View className="flex-row justify-center gap-4 mb-8">
        <Pressable
          onPress={() => {
            setIsRunning(!isRunning);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          className="bg-neutral-900 border border-neutral-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-sm font-semibold text-neutral-200">
            {isRunning ? 'Pause' : 'Resume'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleDone}
          className="bg-emerald-500 px-6 py-3 rounded-2xl active:scale-95"
        >
          <Text className="text-sm font-bold text-black">✓ Claim Dopamine</Text>
        </Pressable>
      </View>

      {/* Thought Parking Lot */}
      <View className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 mt-4 mb-10">
        <Text className="text-xs font-bold text-neutral-300 mb-1">Mental Parking Lot</Text>
        <Text className="text-[11px] text-neutral-500 mb-3">
          Dump intrusive thoughts here so you don’t get derailed.
        </Text>

        <View className="flex-row gap-2 mb-3">
          <TextInput
            value={parkingThought}
            onChangeText={setParkingThought}
            placeholder="e.g. remember to buy eggs..."
            placeholderTextColor="#737373"
            className="flex-1 bg-neutral-950 p-2.5 rounded-xl text-neutral-100 text-xs border border-neutral-800"
          />
          <Pressable
            onPress={handleParkThought}
            className="bg-neutral-800 px-3 py-2 rounded-xl justify-center"
          >
            <Text className="text-xs font-semibold text-white">Park</Text>
          </Pressable>
        </View>

        {parkingLot.map((item, idx) => (
          <View
            key={idx}
            className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/60 mb-1.5"
          >
            <Text className="text-xs text-neutral-300">{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
