/**
 * HTTP请求使用示例
 * 
 * 这个文件展示了如何在React Native组件中使用封装的HTTP请求工具
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import apiService, { User, Device, LoginParams } from '../services/api';
import { setToken, clearToken } from '../utils/http';

const HttpExample: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 模拟登录
  const handleLogin = async () => {
    setLoading(true);
    try {
      const loginParams: LoginParams = {
        username: 'demo@example.com',
        password: 'password123',
      };

      const response = await apiService.login(loginParams);
      
      // 保存token
      setToken(response.token);
      setUser(response.user);
      setIsLoggedIn(true);
      
      Alert.alert('成功', '登录成功！');
    } catch (error) {
      console.error('Login failed:', error);
      // 错误已经在拦截器中处理，这里不需要额外处理
    } finally {
      setLoading(false);
    }
  };

  // 获取用户信息
  const handleGetUserInfo = async () => {
    setLoading(true);
    try {
      const userInfo = await apiService.getUserInfo();
      setUser(userInfo);
      Alert.alert('成功', '用户信息获取成功！');
    } catch (error) {
      console.error('Get user info failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取设备列表
  const handleGetDevices = async () => {
    setLoading(true);
    try {
      const deviceList = await apiService.getDeviceList();
      setDevices(deviceList);
      Alert.alert('成功', `获取到 ${deviceList.length} 个设备`);
    } catch (error) {
      console.error('Get devices failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 扫描设备
  const handleScanDevice = async () => {
    setLoading(true);
    try {
      // 模拟扫码结果
      const qrCode = 'DEVICE_QR_CODE_12345';
      const scanResult = await apiService.scanDevice(qrCode);
      
      Alert.alert('扫码成功', `设备ID: ${scanResult.deviceId}`);
    } catch (error) {
      console.error('Scan device failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 开始充电
  const handleStartCharge = async () => {
    setLoading(true);
    try {
      const chargeParams = {
        deviceId: 'device_001',
        qrCode: 'CHARGE_QR_CODE_12345',
      };
      
      const session = await apiService.startCharge(chargeParams);
      Alert.alert('充电开始', `会话ID: ${session.id}`);
    } catch (error) {
      console.error('Start charge failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取蓝牙状态（使用DRS服务）
  const handleGetBluetoothStatus = async () => {
    setLoading(true);
    try {
      const status = await apiService.getBluetoothStatus();
      Alert.alert('蓝牙状态', `状态: ${status.status ? '开启' : '关闭'}\n${status.message}`);
    } catch (error) {
      console.error('Get bluetooth status failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建备份（使用备份服务）
  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupData = {
        userId: user?.id || 'demo_user',
        data: { settings: {}, preferences: {} },
      };
      
      const backup = await apiService.createBackup(backupData);
      Alert.alert('备份成功', `备份ID: ${backup.backupId}`);
    } catch (error) {
      console.error('Create backup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
      clearToken();
      setUser(null);
      setIsLoggedIn(false);
      setDevices([]);
      Alert.alert('成功', '已退出登录');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时的初始化
  useEffect(() => {
    // 这里可以检查是否有保存的token，如果有则自动登录
    // const savedToken = getToken();
    // if (savedToken) {
    //   setIsLoggedIn(true);
    //   handleGetUserInfo();
    // }
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>HTTP请求示例</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>请求中...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>用户认证</Text>
        
        {!isLoggedIn ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>登录</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.secondary }]}
              onPress={handleGetUserInfo}
              disabled={loading}
            >
              <Text style={styles.buttonText}>获取用户信息</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.error }]}
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.buttonText}>退出登录</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>用户信息</Text>
          <Text style={[styles.info, { color: theme.text }]}>ID: {user.id}</Text>
          <Text style={[styles.info, { color: theme.text }]}>用户名: {user.username}</Text>
          <Text style={[styles.info, { color: theme.text }]}>邮箱: {user.email}</Text>
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>设备管理</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleGetDevices}
            disabled={loading}
          >
            <Text style={styles.buttonText}>获取设备列表</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleScanDevice}
            disabled={loading}
          >
            <Text style={styles.buttonText}>扫描设备</Text>
          </TouchableOpacity>
        </View>
      )}

      {devices.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>设备列表</Text>
          {devices.map((device) => (
            <View key={device.id} style={[styles.deviceItem, { borderColor: theme.border }]}>
              <Text style={[styles.deviceName, { color: theme.text }]}>{device.name}</Text>
              <Text style={[styles.deviceStatus, { color: theme.textSecondary }]}>
                状态: {device.status}
              </Text>
            </View>
          ))}
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>充电服务</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.success }]}
            onPress={handleStartCharge}
            disabled={loading}
          >
            <Text style={styles.buttonText}>开始充电</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>其他服务</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.warning }]}
            onPress={handleGetBluetoothStatus}
            disabled={loading}
          >
            <Text style={styles.buttonText}>检查蓝牙状态</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.info }]}
            onPress={handleCreateBackup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>创建备份</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  deviceItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceStatus: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default HttpExample;
