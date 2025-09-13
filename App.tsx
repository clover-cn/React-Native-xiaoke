import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator, useTheme, initHttp, configureHttp } from './src';
function App() {
  const { theme, isDarkMode } = useTheme();
  useEffect(() => {
    // 初始化HTTP客户端
    console.log('🚀 初始化应用...');

    // 基础初始化
    initHttp();

    // 可选：自定义配置
    configureHttp({
      timeout: 15000, // 15秒超时
      headers: {
        'X-App-Version': '1.0.0',
        'X-Platform': 'react-native',
      },
    });

    console.log('✅ 应用初始化成功');
  }, []);
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
