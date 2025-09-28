import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

interface BluetoothScannerProps {
  onDeviceSelect?: (device: Device) => void;
}

const BluetoothScanner: React.FC<BluetoothScannerProps> = ({ onDeviceSelect }) => {
  const [bleManager] = useState(() => new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothState, setBluetoothState] = useState('Unknown');

  useEffect(() => {
    // 监听蓝牙状态变化
    const subscription = bleManager.onStateChange((state) => {
      setBluetoothState(state);
      if (state === 'PoweredOn') {
        console.log('蓝牙已开启');
      }
    }, true);

    return () => {
      subscription.remove();
      bleManager.destroy();
    };
  }, [bleManager]);

  // 请求蓝牙权限
  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('开始请求Android权限...');
        console.log('Android版本:', Platform.Version);
        
        // 只请求位置权限 (这是肯定存在的)
        console.log('请求位置权限...');
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '位置权限',
            message: '扫描蓝牙设备需要位置权限',
            buttonNeutral: '稍后询问',
            buttonNegative: '拒绝',
            buttonPositive: '允许',
          }
        );

        console.log('位置权限结果:', locationPermission);

        if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('位置权限已授予');
          
          // 尝试请求蓝牙相关权限 (如果存在的话)
          try {
            console.log('尝试请求蓝牙扫描权限...');
            // 这里我们不强制要求蓝牙权限，因为可能在某些设备上不存在
            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN) {
              const bluetoothScanPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
              );
              console.log('蓝牙扫描权限结果:', bluetoothScanPermission);
            }

            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
              const bluetoothConnectPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
              );
              console.log('蓝牙连接权限结果:', bluetoothConnectPermission);
            }
          } catch (bluetoothError) {
            console.log('蓝牙权限请求失败，但位置权限已获得，继续执行:', bluetoothError);
          }

          return true;
        } else {
          console.log('位置权限被拒绝');
          Alert.alert(
            '需要位置权限', 
            '扫描蓝牙设备需要位置权限。请在设置 > 应用权限中开启位置权限。',
            [{ text: '确定' }]
          );
          return false;
        }
      } catch (error) {
        console.error('权限请求失败:', error);
        Alert.alert(
          '权限错误', 
          '权限请求失败。请手动在设置中开启应用的位置和蓝牙权限。',
          [{ text: '确定' }]
        );
        return false;
      }
    }
    return true;
  };

  // 开始扫描蓝牙设备
  const startScan = async () => {
    console.log('点击开始扫描按钮');
    console.log('当前蓝牙状态:', bluetoothState);
    
    const hasPermissions = await requestBluetoothPermissions();
    console.log('权限检查结果:', hasPermissions);
    
    if (!hasPermissions) {
      console.log('权限不足，停止扫描');
      return;
    }

    if (bluetoothState !== 'PoweredOn') {
      console.log('蓝牙未开启');
      Alert.alert('蓝牙未开启', '请先开启设备蓝牙功能');
      return;
    }

    console.log('开始执行蓝牙扫描...');
    setIsScanning(true);
    setDevices([]);
    
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('扫描错误:', error);
        setIsScanning(false);
        Alert.alert('扫描失败', error.message);
        return;
      }

      if (device && device.name) {
        console.log('发现设备:', device.name, device.id);
        
        setDevices(prevDevices => {
          // 避免重复添加相同的设备
          const existingDevice = prevDevices.find(d => d.id === device.id);
          if (!existingDevice) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // 10秒后停止扫描
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  // 停止扫描
  const stopScan = () => {
    console.log('停止扫描');
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  // 连接设备
  const connectToDevice = async (device: Device) => {
    try {
      console.log('正在连接设备:', device.name);
      stopScan(); // 停止扫描

      const connectedDevice = await bleManager.connectToDevice(device.id);
      console.log('设备连接成功:', connectedDevice.name);
      
      Alert.alert('连接成功', `已连接到设备: ${device.name}`);
      
      // 回调给父组件
      if (onDeviceSelect) {
        onDeviceSelect(connectedDevice);
      }
    } catch (error: any) {
      console.error('连接失败:', error);
      Alert.alert('连接失败', error.message || '无法连接到设备');
    }
  };

  // 渲染设备列表项
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || '未知设备'}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        <Text style={styles.deviceRssi}>信号强度: {item.rssi} dBm</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>蓝牙设备扫描</Text>
        <Text style={styles.status}>蓝牙状态: {bluetoothState}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isScanning ? styles.buttonDisabled : styles.buttonEnabled]}
          onPress={isScanning ? stopScan : startScan}
          disabled={bluetoothState !== 'PoweredOn'}
        >
          <Text style={styles.buttonText}>
            {isScanning ? '停止扫描' : '开始扫描'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deviceList}>
        <Text style={styles.deviceCount}>
          发现 {devices.length} 台设备 {isScanning && '(扫描中...)'}
        </Text>
        
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDeviceItem}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
  },
  deviceCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 14,
    color: '#999',
  },
});

export default BluetoothScanner;