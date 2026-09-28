import { View, Text, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from "react"
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Send,
  Trash2,
  Zap,
  Sparkles,
  Layers,
} from "lucide-react-native"
import confetti from "canvas-confetti"
import { MicroTask, AmbientSoundType, ParkingLotItem } from "../../types"
import { ambientEngine } from "../../services/ambient"
import { soundService } from "../../services/sound"

interface FocusRadarModalProps {
  task: MicroTask
  isOpen: boolean
  onClose: () => void
  onCompleteTask: (taskId: string) => void
  parkingLot: ParkingLotItem[]
  onAddParkingLotItem: (text: string) => void
  onDeleteParkingLotItem: (id: string) => void
}

export const FocusRadarModal: React.FC<FocusRadarModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  parkingLot,
  onAddParkingLotItem,
  onDeleteParkingLotItem,
}) => {
  // Timer state (seconds)
  const defaultSeconds = (task.estimatedMinutes || 10) * 60
  const [secondsRemaining, setSecondsRemaining] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none")
  const [volume, setVolume] = useState(0.4)
  const [parkingThought, setParkingThought] = useState("")
  const [showParkingLot, setShowParkingLot] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining((task.estimatedMinutes || 10) * 60)
      setIsRunning(true)
      soundService.playFocusStart()
    } else {
      setIsRunning(false)
      ambientEngine.stop()
      setAmbientSound("none")
    }
  }, [isOpen, task])

  // Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false)
      soundService.playCompletionChime()
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isRunning, secondsRemaining])

  // Handle ambient sound changes
  const handleAmbientChange = (type: AmbientSoundType) => {
    setAmbientSound(type)
    ambientEngine.play(type)
  }

  const handleVolumeChange = (text: string) => {
    const val = parseFloat(text)
    setVolume(val)
    ambientEngine.setVolume(val)
  }

  const handleAddMinutes = (mins: number) => {
    setSecondsRemaining((prev) => prev + mins * 60)
  }

  const handleComplete = () => {
    soundService.playCompletionChime()
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#10B981", "#6366F1", "#EC4899"],
    })
    onCompleteTask(task.id)
    ambientEngine.stop()
    onClose()
  }

  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parkingThought.trim()) return
    onAddParkingLotItem(parkingThought.trim())
    setParkingThought("")
    soundService.playTick()
  }

  if (!isOpen) return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-md">
      {/* Container */}
      <View className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Top bar */}
        <View className="w-full flex items-center justify-between mb-6">
          <View className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <Text>ONE THING RADAR</Text>
          </View>

          <View className="flex items-center gap-2">
            <Pressable
              
              onPress={() => setShowParkingLot(!showParkingLot)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                showParkingLot
                  ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                  : "bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <Text>Thought Parking Lot ({parkingLot.length})</Text>
            </Pressable>

            <Pressable
              
              onPress={() => {
                ambientEngine.stop()
                onClose()
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </Pressable>
          </View>
        </View>

        {/* Task Title */}
        <Text className="text-xl md:text-2xl font-bold text-neutral-100 max-w-lg mb-3 tracking-tight">
          {task.title}
        </Text>

        {/* First Physical Step: The Spark */}
        <View className="w-full max-w-md bg-neutral-950/80 border border-amber-400/30 rounded-xl p-3.5 mb-6 text-left">
          <Text className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
            Your First Physical Action Right Now:
          </Text>
          <Text className="text-sm text-neutral-200 mt-1 font-medium leading-relaxed">
            {task.firstPhysicalStep}
          </Text>
        </View>

        {/* Large Timer Display */}
        <View className="my-2">
          <View className="text-6xl md:text-7xl font-mono tabular-nums font-extrabold tracking-tight text-neutral-100 selection:bg-transparent">
            {timeFormatted}
          </View>
          <View className="text-xs text-neutral-500 mt-1">
            {secondsRemaining === 0
              ? "Time is up! Great focus push."
              : "Dedicated single-task sprint"}
          </View>
        </View>

        {/* Timer Controls */}
        <View className="flex items-center gap-3 my-5">
          <Pressable
            
            onPress={() => setIsRunning(!isRunning)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-semibold text-sm hover:bg-amber-300 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-neutral-950" />
                <Text>Pause</Text>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-neutral-950" />
                <Text>Resume</Text>
              </>
            )}
          </Pressable>

          <Pressable
            
            onPress={() => handleAddMinutes(5)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
          >
            +5 Min
          </Pressable>

          <Pressable
            
            onPress={() => {
              setIsRunning(false)
              setSecondsRemaining(defaultSeconds)
            }}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700 transition-colors"
            
          >
            <RotateCcw className="w-4 h-4" />
          </Pressable>
        </View>

        {/* Ambient Noise Bar */}
        <View className="w-full max-w-md bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-6">
          <View className="flex items-center gap-1.5">
            <Text className="text-neutral-500 font-medium mr-1">ADHD Noise:</Text>
            {(["none", "brown", "rain", "white"] as AmbientSoundType[]).map((type) => {
              const labels: Record<AmbientSoundType, string> = {
                none: "Off",
                brown: "Brown Noise",
                rain: "Rain",
                white: "White Noise",
              }
              const isSelected = ambientSound === type
              return (
                <Pressable
                  key={type}
                  
                  onPress={() => handleAmbientChange(type)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    isSelected
                      ? "bg-neutral-800 text-amber-300 font-semibold border border-neutral-700"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {labels[type]}
                </Pressable>
              )
            })}
          </View>

          {ambientSound !== "none" && (
            <View className="flex items-center gap-2 shrink-0">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              <TextInput
                
                value={String(volume)}
                onChangeText={handleVolumeChange}
                className="w-16 accent-amber-400"
              />
            </View>
          )}
        </View>

        {/* Mark Done / Finish button */}
        <Pressable
          
          onPress={handleComplete}
          className="w-full max-w-md py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <Text>I Finished This! (Claim Dopamine)</Text>
        </Pressable>

        {/* Thought Parking Lot Drawer */}
        {showParkingLot && (
          <View className="w-full mt-6 pt-5 border-t border-neutral-800 text-left">
            <View className="flex items-center justify-between mb-2">
              <View className="text-xs font-semibold text-neutral-300">Mental Parking Lot</View>
              <Text className="text-[11px] text-neutral-500">
                Dump random thoughts here so you don’t derail
              </Text>
            </View>

            <View  className="flex gap-2 mb-3">
              <TextInput
                
                value={parkingThought}
                onChangeText={setParkingThought}
                placeholder="e.g. Remember to buy milk, check text from mom..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
              <Pressable
                
                disabled={!parkingThought.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-40"
              >
                Park Thought
              </Pressable>
            </View>

            <View className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar">
              {parkingLot.length === 0 ? (
                <View className="text-xs text-neutral-600 text-center py-2">
                  No parked thoughts yet. Whenever your mind wanders, type it here.
                </View>
              ) : (
                parkingLot.map((item) => (
                  <View
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-md bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300"
                  >
                    <Text>{item.text}</Text>
                    <Pressable
                      
                      onPress={() => onDeleteParkingLotItem(item.id)}
                      className="text-neutral-500 hover:text-rose-400 ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
