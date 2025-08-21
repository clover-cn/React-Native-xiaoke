import React, { useState } from 'react';
import { View, StyleSheet, BackHandler, ToastAndroid } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/HomeScreen';
import ChargeScreen from '../screens/ChargeScreen';
import HelpScreen from '../screens/HelpScreen';
import MyScreen from '../screens/MyScreen';
import ScanScreen from '../screens/ScanScreen';
import TabBar from '../components/TabBar';
import { TabBarImages } from '../assets/tabBarImages';
import { ScanProvider, useScan } from '../contexts/ScanContext';
type Screen = 'home' | 'charge' | 'help' | 'my';

const AppNavigatorContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [scanResult, setScanResult] = useState<string | undefined>();
  const { theme } = useTheme();
  const { isScanning, startScan, stopScan, onScanCancel } = useScan();
  const lastBackPressed = React.useRef<number | null>(null);

  React.useEffect(() => {
    const backAction = () => {
      if (isScanning) {
        if (onScanCancel) {
          onScanCancel();
        }
        stopScan();
        return true;
      }

      if (currentScreen !== 'home') {
        setCurrentScreen('home');
        return true;
      }

      if (
        lastBackPressed.current &&
        lastBackPressed.current + 2000 >= Date.now()
      ) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressed.current = Date.now();
      ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen, isScanning, onScanCancel, stopScan]);

  // 按照小程序源码的TabBar配置
  const leftTabs = [
    {
      key: 'home',
      title: '首页',
      icon: TabBarImages.home.normal,
      activeIcon: TabBarImages.home.active,
      index: '1'
    },
    {
      key: 'charge',
      title: '充值',
      icon: TabBarImages.charge.normal,
      activeIcon: TabBarImages.charge.active,
      index: '2'
    }
  ];

  const rightTabs = [
    {
      key: 'help',
      title: '帮助',
      icon: TabBarImages.help.normal,
      activeIcon: TabBarImages.help.active,
      index: '3'
    },
    {
      key: 'my',
      title: '我的',
      icon: TabBarImages.my.normal,
      activeIcon: TabBarImages.my.active,
      index: '4'
    }
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            scanResult={scanResult}
            onScanResultReceived={() => setScanResult(undefined)}
          />
        );
      case 'charge':
        return <ChargeScreen />;
      case 'help':
        return <HelpScreen />;
      case 'my':
        return <MyScreen />;
      default:
        return (
          <HomeScreen
            scanResult={scanResult}
            onScanResultReceived={() => setScanResult(undefined)}
          />
        );
    }
  };

  const handleTabPress = (tabKey: string, index: string) => {
    if (index === '5') {
      // 启动扫码功能
      startScan(
        (data: string) => {
          // 将扫码结果传递给首页
          setScanResult(data);
          // 确保当前在首页
          setCurrentScreen('home');
        },
        () => {
          console.log('扫码取消');
          // 扫码取消的处理
        }
      );
      return;
    }
    setCurrentScreen(tabKey as Screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.screen}>
        {renderScreen()}
      </View>
      {/* 只有在非扫码状态下才显示 TabBar */}
      {!isScanning && (
        <TabBar
          leftTabs={leftTabs}
          rightTabs={rightTabs}
          activeTab={currentScreen}
          onTabPress={handleTabPress}
        />
      )}

      {/* 扫码界面作为全屏覆盖层 */}
      {isScanning && (
        <View style={styles.scanOverlay}>
          <ScanScreen />
        </View>
      )}
    </View>
  );
};

// 主导航组件，包装了 ScanProvider
const AppNavigator: React.FC = () => {
  return (
    <ScanProvider>
      <AppNavigatorContent />
    </ScanProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000',
  },
});

export default AppNavigator;
