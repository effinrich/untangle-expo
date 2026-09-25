import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MicroTask } from '../services/api';

interface TaskCardMobileProps {
  task: MicroTask;
  onToggleComplete: (id: string) => void;
  onStartFocus: (task: MicroTask) => void;
}

export const TaskCardMobile: React.FC<TaskCardMobileProps> = ({
  task,
  onToggleComplete,
  onStartFocus,
}) => {
  const handleCheck = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggleComplete(task.id);
  };

  const handleFocus = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartFocus(task);
  };

  const energyColors = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-rose-400',
  };

  return (
    <View
      className={`p-4 rounded-2xl mb-3 border ${
        task.completed
          ? 'bg-neutral-900/30 border-neutral-900 opacity-50'
          : 'bg-neutral-900/80 border-neutral-800'
      }`}
    >
      <View className="flex-row items-start gap-3">
        {/* Checkbox */}
        <Pressable
          onPress={handleCheck}
          hitSlop={12}
          className={`w-6 h-6 rounded-lg border items-center justify-center mt-0.5 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-400'
              : 'border-neutral-700 bg-neutral-950'
          }`}
        >
          {task.completed && <Text className="text-black font-bold text-xs">✓</Text>}
        </Pressable>

        <View className="flex-1">
          {/* Title and metadata */}
          <Text
            className={`text-base font-semibold leading-snug ${
              task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
            }`}
          >
            {task.title}
          </Text>

          {/* Metadata chips */}
          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            <View className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              <Text className="text-[11px] text-neutral-400 font-medium">{task.category}</Text>
            </View>
            <Text className="text-neutral-600">·</Text>
            <Text className={`text-[11px] capitalize font-medium ${energyColors[task.energyLevel]}`}>
              {task.energyLevel} energy
            </Text>
            <Text className="text-neutral-600">·</Text>
            <Text className="text-[11px] text-neutral-400 font-mono">
              {task.estimatedMinutes}m
            </Text>
          </View>

          {/* First physical step prompt */}
          {!task.completed && (
            <View className="mt-2.5 p-2.5 bg-neutral-950 rounded-xl border border-amber-500/20">
              <Text className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                First Physical Action:
              </Text>
              <Text className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                {task.firstPhysicalStep}
              </Text>
            </View>
          )}

          {/* Action Row */}
          {!task.completed && (
            <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-neutral-800/80">
              <Pressable
                onPress={handleFocus}
                className="bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg active:scale-95"
              >
                <Text className="text-xs font-semibold text-amber-300">
                  ▶ Focus Radar (One Thing)
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
