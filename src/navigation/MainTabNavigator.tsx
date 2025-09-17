import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ChargeScreen from '../screens/ChargeScreen';
import HelpScreen from '../screens/HelpScreen';
import MyScreen from '../screens/MyScreen';
import ScanScreen from '../screens/ScanScreen';
import CustomTabNavigator from './CustomTabNavigator';
import { MainTabParamList } from './types';
import { useScan } from '../contexts/ScanContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | undefined>();
  const { isScanning, startScan, stopScan } = useScan();

  const handleScanPress = () => {
    startScan(
      (data: string) => {
        // 将扫码结果传递给首页
        setScanResult(data);
      },
      () => {
        console.log('扫码取消');
      }
    );
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <CustomTabNavigator {...props} onScanPress={handleScanPress} />
        )}
      >
        <Tab.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              scanResult={scanResult}
              onScanResultReceived={() => setScanResult(undefined)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Charge" component={ChargeScreen} />
        <Tab.Screen name="Help" component={HelpScreen} />
        <Tab.Screen name="My" component={MyScreen} />
      </Tab.Navigator>

      {/* 扫码界面作为全屏覆盖层 */}
      {isScanning && (
        <View style={styles.scanOverlay}>
          <ScanScreen />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default MainTabNavigator;