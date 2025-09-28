import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  // 初始化蓝牙管理器
  async initialize(): Promise<boolean> {
    try {
      // 如果管理器已被销毁，重新创建
      if (!this.manager || this.manager.state === undefined) {
        this.manager = new BleManager();
      }

      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      const state = await this.manager.state();
      if (state !== 'PoweredOn') {
        Alert.alert('蓝牙未开启', '请开启蓝牙后重试');
        return false;
      }

      return true;
    } catch (error) {
      console.error('蓝牙初始化失败:', error);
      // 如果初始化失败，尝试重新创建管理器
      try {
        this.manager = new BleManager();
        const hasPermissions = await this.requestPermissions();
        if (hasPermissions) {
          const state = await this.manager.state();
          if (state === 'PoweredOn') {
            return true;
          }
        }
      } catch (retryError) {
        console.error('重新初始化蓝牙失败:', retryError);
      }
      return false;
    }
  }

  // 请求蓝牙权限
  private async requestPermissions(): Promise<boolean> {
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
          },
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
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              );
              console.log('蓝牙扫描权限结果:', bluetoothScanPermission);

              // 只有在权限被明确拒绝时才提醒用户
              if (
                bluetoothScanPermission === PermissionsAndroid.RESULTS.DENIED
              ) {
                console.log('蓝牙扫描权限被拒绝，但不强制要求');
              } else if (
                bluetoothScanPermission ===
                PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
              ) {
                console.log('蓝牙扫描权限不再询问，但可能已经授予');
              } else if (
                bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED
              ) {
                console.log('蓝牙扫描权限已授予');
              }
            }

            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
              const bluetoothConnectPermission =
                await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                );
              console.log('蓝牙连接权限结果:', bluetoothConnectPermission);

              // 只有在权限被明确拒绝时才提醒用户
              if (
                bluetoothConnectPermission === PermissionsAndroid.RESULTS.DENIED
              ) {
                console.log('蓝牙连接权限被拒绝，但不强制要求');
              } else if (
                bluetoothConnectPermission ===
                PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
              ) {
                console.log('蓝牙连接权限不再询问，但可能已经授予');
              } else if (
                bluetoothConnectPermission ===
                PermissionsAndroid.RESULTS.GRANTED
              ) {
                console.log('蓝牙连接权限已授予');
              }
            }
          } catch (bluetoothError) {
            console.log(
              '蓝牙权限请求失败，但位置权限已获得，继续执行:',
              bluetoothError,
            );
          }
          return true;
        } else {
          console.log('位置权限被拒绝');
          Alert.alert(
            '需要位置权限',
            '扫描蓝牙设备需要位置权限。请在设置 > 应用权限中开启位置权限。',
            [{ text: '确定' }],
          );
          return false;
        }
      } catch (error) {
        console.error('权限请求失败:', error);
        Alert.alert(
          '权限错误',
          '权限请求失败。请手动在设置中开启应用的位置和蓝牙权限。',
          [{ text: '确定' }],
        );
        return false;
      }
    }
    return true;
  }

  // 扫描设备
  async scanDevices(
    onDeviceFound: (device: Device) => void,
    timeout: number = 10000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let isScanning = true;
      let hasFoundDevices = false;

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('扫描错误:', error);

          // 只有在权限相关错误时才提示用户
          if (error.message && error.message.includes('permission')) {
            Alert.alert(
              '蓝牙权限不足',
              '扫描蓝牙设备失败，请检查应用的蓝牙和位置权限设置。',
              [{ text: '确定' }],
            );
          }

          reject(error);
          return;
        }

        if (device && device.name && isScanning) {
          hasFoundDevices = true;
          onDeviceFound(device);
        }
      });

      // 设置扫描超时
      setTimeout(() => {
        isScanning = false;
        this.manager.stopDeviceScan();
        console.log(`扫描完成，${hasFoundDevices ? '发现设备' : '未发现设备'}`);
        resolve();
      }, timeout);
    });
  }

  // 停止扫描
  stopScan(): void {
    this.manager.stopDeviceScan(); // 停止扫描
  }

  // 连接到设备
  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      this.manager.stopDeviceScan(); // 停止扫描

      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;
      console.log('设备连接成功:', device.name);

      return device;
    } catch (error: any) {
      console.error('连接设备失败:', error);
      throw error;
    }
  }

  // 断开设备连接
  async disconnectDevice(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        console.log('设备已断开连接');
        this.connectedDevice = null;
      } catch (error) {
        console.error('断开连接失败:', error);
      }
    }
  }

  // 发送数据到设备
  async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    data: string,
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        data,
      );
      console.log('数据发送成功:', data);
    } catch (error: any) {
      console.error('发送数据失败:', error);
      throw error;
    }
  }

  // 读取设备数据
  async readCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      const characteristic =
        await this.connectedDevice.readCharacteristicForService(
          serviceUUID,
          characteristicUUID,
        );
      console.log('读取数据成功:', characteristic.value);
      return characteristic.value || '';
    } catch (error: any) {
      console.error('读取数据失败:', error);
      throw error;
    }
  }

  // 监听设备数据变化
  async monitorCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    onDataReceived: (data: string) => void,
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      this.connectedDevice.monitorCharacteristicForService(
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error('监听数据失败:', error);
            return;
          }

          if (characteristic?.value) {
            console.log('收到数据:', characteristic.value);
            onDataReceived(characteristic.value);
          }
        },
      );
    } catch (error: any) {
      console.error('开始监听失败:', error);
      throw error;
    }
  }

  // 获取当前连接的设备
  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  // 检查设备连接状态
  async isDeviceConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      const isConnected = await this.connectedDevice.isConnected();
      return isConnected;
    } catch (error) {
      console.error('检查连接状态失败:', error);
      return false;
    }
  }

  // 销毁蓝牙管理器
  destroy(): void {
    try {
      // 先断开当前连接的设备
      if (this.connectedDevice) {
        this.manager
          .cancelDeviceConnection(this.connectedDevice.id)
          .catch(error => {
            console.log('断开连接时出错:', error);
          });
      }

      // 停止扫描
      this.manager.stopDeviceScan();

      // 销毁管理器
      this.manager.destroy();

      // 清理状态
      this.connectedDevice = null;
    } catch (error) {
      console.error('销毁蓝牙管理器时出错:', error);
    }
  }
}

export default BluetoothService;
