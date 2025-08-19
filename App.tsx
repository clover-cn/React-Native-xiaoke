import React from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { AppNavigator, useTheme } from './src';

function App() {
  const { theme, isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      {/* 让页面内各自控制沉浸式状态栏，去掉全局 StatusBar 覆盖 */}
      {/* 不用 SafeAreaView 包住整个 App，避免状态栏区域被全局白色填充；
          首页会自己处理沉浸式背景和安全区。其他页面若需要可局部使用 SafeAreaView。 */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
