import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { DeviceEventEmitter } from 'react-native';

// 创建导航引用
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 导航事件类型
export const NAVIGATION_EVENTS = {
  LOGIN_EXPIRED: 'LOGIN_EXPIRED',
  LOGOUT: 'LOGOUT',
} as const;

// 导航到指定页面
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

// 重置导航栈到指定页面
export function reset(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: name as any, params }],
    });
  }
}

// 返回上一页
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

// 获取当前路由名称
export function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

// 登录过期处理 - 通过事件系统触发登出
export function handleLoginExpired() {
  console.log('🔐 处理登录过期，触发登出事件');
  
  // 发出登录过期事件，由AppNavigator监听并处理
  DeviceEventEmitter.emit(NAVIGATION_EVENTS.LOGIN_EXPIRED);
}

// 触发登出
export function triggerLogout() {
  console.log('🚪 触发登出事件');
  
  // 发出登出事件
  DeviceEventEmitter.emit(NAVIGATION_EVENTS.LOGOUT);
}

// ==================== 常用导航方法 ====================

// 跳转到首页 (Tab导航中的Home页面)
export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Home' });
  }
}

// 跳转到充值页面
export function navigateToCharge() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Charge' });
  }
}

// 跳转到帮助页面
export function navigateToHelp() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Help' });
  }
}

// 跳转到我的页面
export function navigateToMy() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'My' });
  }
}

// 打开扫码页面
export function openScanScreen(onResult?: (data: string) => void, onCancel?: () => void) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Scan', { onResult, onCancel });
  }
}

// 跳转到任意Tab页面的通用方法
export function navigateToTab(tabName: 'Home' | 'Charge' | 'Help' | 'My') {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: tabName });
  }
}