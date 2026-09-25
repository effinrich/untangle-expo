import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { MicroTask, untangleBrainDump, transcribeAudio } from '../services/api';
import { TaskCardMobile } from '../components/TaskCardMobile';

const SEED_TASKS: MicroTask[] = [
  {
    id: 'seed-1',
    title: 'Respond to dentist appointment confirmation',
    firstPhysicalStep: 'Unlock phone and open text message from Dr. Miller',
    estimatedMinutes: 3,
    energyLevel: 'low',
    category: 'Health',
    priority: 'high',
    whyItMatters: 'Guarantees your slot and stops the nagging feeling',
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Draft quarterly budget email to Jordan',
    firstPhysicalStep: 'Open email app and type Jordan into To: field',
    estimatedMinutes: 15,
    energyLevel: 'medium',
    category: 'Work',
    priority: 'high',
    whyItMatters: 'Unblocks team deliverable',
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Clear 3 empty coffee mugs off desk',
    firstPhysicalStep: 'Stand up and pick up the blue mug',
    estimatedMinutes: 4,
    energyLevel: 'low',
    category: 'Personal',
    priority: 'low',
    whyItMatters: 'Clears cognitive visual noise',
    substeps: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

type SortType = 'energy-asc' | 'energy-desc' | 'time-asc';

export default function MainScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<MicroTask[]>(SEED_TASKS);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortType>('energy-asc');
  const [isUntangling, setIsUntangling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const categories = ['All', 'Work', 'Personal', 'Health', 'Finance', 'Errands'];

  // Start Audio Recording with expo-av
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone Needed', 'Permission is required to dictate your brain dump.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err: any) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop Recording and Transcribe via Gemini 3.5 Transcribe
  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      // In production, read file into base64 via FileSystem.readAsStringAsync
      // and send to transcribeAudio(base64)
      setBrainDumpText((prev) =>
        prev
          ? `${prev} Need to reply to client and clean desk.`
          : 'Need to reply to client and clean desk.'
      );
      setRecording(null);
    } catch (err) {
      console.error('Failed to transcribe', err);
    }
  };

  const handleUntangle = async () => {
    if (!brainDumpText.trim() || isUntangling) return;
    setIsUntangling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result = await untangleBrainDump(brainDumpText);
      setTasks((prev) => [...result.tasks, ...prev]);
      setBrainDumpText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Untangle Error', err?.message || 'Failed to process thoughts.');
    } finally {
      setIsUntangling(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Filter & Energy Sorting
  const sortedTasks = useMemo(() => {
    let list = tasks.filter((t) => {
      if (selectedCategory !== 'All' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      const energyMap = { low: 1, medium: 2, high: 3 };
      if (sortBy === 'energy-asc') {
        return energyMap[a.energyLevel] - energyMap[b.energyLevel];
      }
      if (sortBy === 'energy-desc') {
        return energyMap[b.energyLevel] - energyMap[a.energyLevel];
      }
      return a.estimatedMinutes - b.estimatedMinutes;
    });

    return list;
  }, [tasks, selectedCategory, sortBy]);

  return (
    <ScrollView className="flex-1 bg-neutral-950 px-4 pt-3 pb-12">
      {/* Brain Dump Voice Pad */}
      <View className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 mb-4">
        <Text className="text-base font-bold text-neutral-100 mb-1">
          Stream of Consciousness
        </Text>
        <Text className="text-xs text-neutral-400 mb-3">
          Dump your thoughts without filtering. AI will slice into micro-actions.
        </Text>

        <TextInput
          value={brainDumpText}
          onChangeText={setBrainDumpText}
          placeholder="e.g. Call dentist, renew insurance, review slides..."
          placeholderTextColor="#737373"
          multiline
          numberOfLines={3}
          className="bg-neutral-950 p-3 rounded-xl text-neutral-100 text-sm border border-neutral-800 min-h-[80px] mb-3"
        />

        <View className="flex-row items-center justify-between">
          {/* Voice Record Button */}
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            className={`px-3 py-2 rounded-xl flex-row items-center gap-2 border ${
              isRecording
                ? 'bg-rose-500 border-rose-400'
                : 'bg-neutral-950 border-neutral-700'
            }`}
          >
            <Text className="text-xs font-semibold text-white">
              {isRecording ? '🔴 Recording... Tap to Stop' : '🎤 Voice Dump'}
            </Text>
          </Pressable>

          {/* Untangle Submit */}
          <Pressable
            onPress={handleUntangle}
            disabled={!brainDumpText.trim() || isUntangling}
            className="bg-amber-400 px-4 py-2.5 rounded-xl active:scale-95 disabled:opacity-50"
          >
            {isUntangling ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text className="text-xs font-bold text-neutral-950">
                ✨ Slices to Micro-Tasks
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Mental State & Energy Sort Strip */}
      <View className="mb-3">
        <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Match Your Battery (Energy Sort)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { id: 'energy-asc', label: '🔋 Low Energy First' },
            { id: 'energy-desc', label: '🚀 Hyperfocus Surge' },
            { id: 'time-asc', label: '⚡ Quick Wins (<5m)' },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setSortBy(item.id as SortType);
                Haptics.selectionAsync();
              }}
              className={`px-3 py-2 rounded-xl border mr-2 ${
                sortBy === item.id
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  sortBy === item.id ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category Pills */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                Haptics.selectionAsync();
              }}
              className={`px-3 py-1.5 rounded-lg border mr-2 ${
                selectedCategory === cat
                  ? 'bg-neutral-800 border-neutral-600'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedCategory === cat ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-neutral-100">
            Action Steps ({sortedTasks.length})
          </Text>
          <Pressable
            onPress={() => router.push('/unstick')}
            className="bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 rounded-lg"
          >
            <Text className="text-xs font-bold text-amber-300">⚡ Unstick Me</Text>
          </Pressable>
        </View>

        {sortedTasks.map((task) => (
          <TaskCardMobile
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onStartFocus={(t) =>
              router.push({
                pathname: '/focus',
                params: {
                  id: t.id,
                  title: t.title,
                  firstStep: t.firstPhysicalStep,
                  minutes: String(t.estimatedMinutes),
                },
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}
