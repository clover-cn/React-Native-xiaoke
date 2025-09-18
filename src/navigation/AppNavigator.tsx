import React, { useState, useEffect, useRef } from 'react';
import {
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import ScanScreen from '../screens/ScanScreen';
import { RootStackParamList } from './types';
import { useScan } from '../contexts/ScanContext';
import { getToken } from '../utils/interceptors';
import ProjectList from '../screens/projectList';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isScanning, stopScan, onScanCancel } = useScan();

  // 检查初始登录状态
  const [initialRouteName, setInitialRouteName] = useState<
    keyof RootStackParamList | null
  >(null);

  useEffect(() => {
    // 检查是否有token来决定初始路由
    const token = getToken();
    setInitialRouteName(token ? 'Main' : 'Auth');
  }, []);

  // 处理硬件返回键：仅在扫码时拦截
  useEffect(() => {
    const backAction = () => {
      // 如果正在扫码，取消扫码
      if (isScanning) {
        if (onScanCancel) {
          onScanCancel();
        }
        stopScan();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isScanning, onScanCancel, stopScan]);

  // 如果还没确定初始路由，显示加载状态
  if (!initialRouteName) {
    return null; // 或者返回一个Loading组件
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ProjectList"
        component={ProjectList}
        options={{
          presentation: 'card',
          headerShown: true,
          title: '选择项目',
          headerStyle: {
            backgroundColor: '#6200ea',
            elevation: 4,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
            fontSize: 20,
          },
          headerTitleAlign: 'center', // left | center
        }}
      />
    </Stack.Navigator>
  );
};

// 处理主页面的返回键逻辑
export const useMainScreenBackHandler = () => {
  const navigation = useNavigation<any>();
  const lastBackPressed = useRef<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        const state = navigation.getState();

        // 安全检查 state 和相关属性
        if (!state || !state.routes || state.index === undefined) {
          return false;
        }

        const currentRoute = state.routes[state.index];

        // 如果当前在Tab Navigator中
        if (currentRoute?.name === 'Main' && currentRoute.state) {
          const tabState = currentRoute.state;
          if (tabState.routes && tabState.index !== undefined) {
            const currentTab = tabState.routes[tabState.index];

            // 如果不在首页，先跳转到首页
            if (currentTab?.name !== 'Home') {
              navigation.navigate('Main', { screen: 'Home' });
              return true;
            }
          }
        }

        // 如果已经在首页，双击退出
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
        backAction,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );
};

export default AppNavigator;
