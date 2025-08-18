import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/HomeScreen';
import ChargeScreen from '../screens/ChargeScreen';
import HelpScreen from '../screens/HelpScreen';
import MyScreen from '../screens/MyScreen';
import TabBar from '../components/TabBar';
import { TabBarImages } from '../assets/tabBarImages';

type Screen = 'home' | 'charge' | 'scan' | 'help' | 'my';

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { theme } = useTheme();

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
        return <HomeScreen />;
      case 'charge':
        return <ChargeScreen />;
      case 'scan':
        return <HomeScreen />; // 扫码功能暂时显示首页
      case 'help':
        return <HelpScreen />;
      case 'my':
        return <MyScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const handleTabPress = (tabKey: string, index: string) => {
    if (index === '5') {
      // 扫码功能
      console.log('扫码');
      return;
    }
    setCurrentScreen(tabKey as Screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.screen}>
        {renderScreen()}
      </View>
      <TabBar
        leftTabs={leftTabs}
        rightTabs={rightTabs}
        activeTab={currentScreen}
        onTabPress={handleTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});

export default AppNavigator;
