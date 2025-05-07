import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomNavbar } from '@/components/customnavbar';
import { CustomBottomBar } from '@/components/CustomBottomBar';

export default function Layout() {
  const pathname = usePathname();
  const showNavigation = pathname !== '/';

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          header: () => showNavigation ? <CustomNavbar /> : null,
        }}
      />
      {showNavigation && <CustomBottomBar />}
      {showNavigation && <StatusBar style="light" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});