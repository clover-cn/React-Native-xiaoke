import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator, useTheme, initHttp, configureHttp } from './src';
import { ScanProvider, useScan } from './src/contexts/ScanContext';
import { shortcutService, SHORTCUT_ACTIONS } from './src/services/shortcutService';

// 应用主组件内容
const AppContent: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { startScan } = useScan();
  const shortcutListenerRef = useRef<boolean>(false);

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

    // 初始化快捷方式服务
    const initializeShortcuts = async () => {
      try {
        await shortcutService.initializeShortcuts();
        console.log('✅ 快捷方式服务初始化成功');
      } catch (error) {
        console.error('❌ 快捷方式服务初始化失败:', error);
      }
    };

    initializeShortcuts();
    console.log('✅ 应用初始化成功');
  }, []);

  useEffect(() => {
    // 添加快捷方式监听器（只添加一次）
    if (!shortcutListenerRef.current) {
      shortcutListenerRef.current = true;

      // 处理快捷方式点击事件
      const handleShortcutPress = (shortcutId: string) => {
        console.log('🚀 快捷方式被触发:', shortcutId);
        
        if (shortcutId === SHORTCUT_ACTIONS.SCAN_QR_CODE) {
          // 启动扫码功能
          startScan(
            (data: string) => {
              console.log('📱 快捷方式扫码结果:', data);
              // 这里可以根据需要处理扫码结果，比如显示通知或跳转页面
            },
            () => {
              console.log('⏹️ 快捷方式扫码被取消');
            }
          );
        }
      };

      // 添加快捷方式监听器
      shortcutService.addShortcutUsedListener(handleShortcutPress);

      // 检查应用是否通过快捷方式启动
      const checkInitialShortcut = async () => {
        try {
          const initialShortcutId = await shortcutService.getInitialShortcutId();
          if (initialShortcutId) {
            console.log('🚀 应用通过快捷方式启动:', initialShortcutId);
            handleShortcutPress(initialShortcutId);
          }
        } catch (error) {
          console.error('❌ 检查初始快捷方式失败:', error);
        }
      };

      checkInitialShortcut();
    }

    // 清理函数
    return () => {
      if (shortcutListenerRef.current) {
        shortcutService.removeShortcutUsedListener();
        shortcutListenerRef.current = false;
      }
    };
  }, [startScan]);

  return <AppNavigator />;
};

// 主应用组件
function App() {
  return (
    <SafeAreaProvider>
      <ScanProvider>
        {/* 让页面内各自控制沉浸式状态栏，去掉全局 StatusBar 覆盖 */}
        {/* 不用 SafeAreaView 包住整个 App，避免状态栏区域被全局白色填充；
            首页会自己处理沉浸式背景和安全区。其他页面若需要可局部使用 SafeAreaView。 */}
        <AppContent />
      </ScanProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
