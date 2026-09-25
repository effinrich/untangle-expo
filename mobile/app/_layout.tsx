import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#f5f5f5',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Tangle',
              headerLargeTitle: false,
            }}
          />
          <Stack.Screen
            name="focus"
            options={{
              title: 'One Thing Radar',
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="unstick"
            options={{
              title: 'Unstick Assistant',
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
