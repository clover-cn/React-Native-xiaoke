/**
 * App.tsx 示例文件
 * 展示如何在应用启动时初始化HTTP客户端
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator, initHttp, configureHttp } from './src';

const App: React.FC = () => {
  useEffect(() => {
    // 初始化HTTP客户端
    console.log('🚀 Initializing app...');
    
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
    
    console.log('✅ App initialized successfully');
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </>
  );
};

export default App;
