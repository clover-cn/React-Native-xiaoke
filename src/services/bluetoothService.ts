import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private isCancelledRef = false; // 用于标记是否已取消蓝牙操作
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

  // 扫描设备 - 支持提前停止扫描
  async scanDevices(
    onDeviceFound: (device: Device) => void,
    timeout: number = 10000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let isScanning = true;
      let hasFoundDevices = false;
      let timeoutId: number | null = null;
      this.isCancelledRef = false;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (isScanning) {
          isScanning = false;
          this.manager.stopDeviceScan();
        }
      };

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('扫描错误:', error);
          cleanup();

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
          try {
            // 找到目标设备后，停止扫描
            if (this.isCancelledRef) {
              cleanup();
              resolve();
            }
          } catch (callbackError) {
            console.error('设备处理回调出错:', callbackError);
            cleanup();
            reject(callbackError);
          }
        }
      });

      // 设置扫描超时
      timeoutId = setTimeout(() => {
        if (this.isCancelledRef) {
          console.log('扫描被取消...');
          cleanup();
          return;
        }
        cleanup();
        console.log('扫描蓝牙超时，已取消扫描');
        reject(new Error('未找到蓝牙设备'));
      }, timeout);
    });
  }

  // 停止扫描
  stopScan(): void {
    this.isCancelledRef = true;
    this.manager.stopDeviceScan(); // 停止扫描
  }

  // 连接到设备 - 添加超时处理
  async connectToDevice(
    deviceId: string,
    timeout: number = 10000, // 连接超时时间，默认10秒
  ): Promise<Device> {
    try {
      console.log('开始连接设备:', deviceId);

      // 使用 Promise.race 实现连接超时
      const device = await Promise.race([
        this.manager.connectToDevice(deviceId),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('连接设备超时'));
          }, timeout);
        }),
      ]);

      // 验证设备连接状态
      const isConnected = await device.isConnected();
      if (!isConnected) {
        throw new Error('设备连接验证失败');
      }

      this.connectedDevice = device;
      console.log('设备连接并配置成功:', device.name || deviceId);
      return device;
    } catch (error: any) {
      console.error('连接设备失败:', error);

      // 尝试清理可能的连接状态
      try {
        await this.manager.cancelDeviceConnection(deviceId);
      } catch (cleanupError) {
        console.log('清理连接状态时出错:', cleanupError);
      }
      
      throw new Error('连接设备失败');
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

  // 获取设备的所有服务和特征值
  async getDeviceServicesAndCharacteristics(): Promise<{
    services: Array<{
      uuid: string;
      characteristics: Array<{
        uuid: string;
        isReadable: boolean;
        isWritableWithoutResponse: boolean;
        isWritableWithResponse: boolean;
        isNotifiable: boolean;
        isIndicatable: boolean;
      }>;
    }>;
  } | null> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      const isConnected = await this.connectedDevice.isConnected();
      if (!isConnected) {
        throw new Error('设备已断开连接');
      }
      // 执行服务发现
      await this.connectedDevice.discoverAllServicesAndCharacteristics();
      
      // 获取所有服务
      const services = await this.connectedDevice.services();
      // console.log(`发现 ${services.length} 个服务`);
      
      const servicesInfo = [];

      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        // console.log(`处理服务 ${i + 1}/${services.length}: ${service.uuid}`);

        try {
          // 获取每个服务的特征值
          const characteristics = await service.characteristics();
          // console.log(`服务 ${service.uuid} 有 ${characteristics.length} 个特征值`);

          const characteristicsInfo = [];

          for (let j = 0; j < characteristics.length; j++) {
            const characteristic = characteristics[j];
            // console.log(`处理特征值 ${j + 1}/${characteristics.length}: ${characteristic.uuid}`);

            try {
              characteristicsInfo.push({
                uuid: characteristic.uuid,
                isReadable: characteristic.isReadable,
                isWritableWithoutResponse: characteristic.isWritableWithoutResponse,
                isWritableWithResponse: characteristic.isWritableWithResponse,
                isNotifiable: characteristic.isNotifiable,
                isIndicatable: characteristic.isIndicatable,
              });
            } catch (charError) {
              console.error(`获取特征值 ${characteristic.uuid} 属性失败:`, charError);
              // 继续处理其他特征值，不中断整个流程
              characteristicsInfo.push({
                uuid: characteristic.uuid,
                isReadable: false,
                isWritableWithoutResponse: false,
                isWritableWithResponse: false,
                isNotifiable: false,
                isIndicatable: false,
              });
            }
          }

          servicesInfo.push({
            uuid: service.uuid,
            characteristics: characteristicsInfo,
          });
        } catch (serviceError) {
          console.error(`获取服务 ${service.uuid} 的特征值失败:`, serviceError);
          // 继续处理其他服务，不中断整个流程
          servicesInfo.push({
            uuid: service.uuid,
            characteristics: [],
          });
        }
      }

      // console.log(`成功获取 ${servicesInfo.length} 个服务信息`);
      return { services: servicesInfo };
    } catch (error: any) {
      console.error('获取服务和特征值失败:', error);
      
      // 提供更详细的错误信息
      if (error.message && error.message.includes('disconnected')) {
        throw new Error('设备连接已断开，请重新连接设备');
      } else if (error.reason) {
        console.error('错误详情:', error.reason);
        throw new Error(`蓝牙操作失败: ${error.reason}`);
      } else {
        throw new Error('获取设备服务信息失败，请重试');
      }
    }
  }

  // 获取可写的特征值（用于发送数据）
  async getWritableCharacteristics(): Promise<
    Array<{
      serviceUUID: string;
      characteristicUUID: string;
      withoutResponse: boolean;
      withResponse: boolean;
    }>
  > {
    const servicesInfo = await this.getDeviceServicesAndCharacteristics();
    const writableCharacteristics = [];

    if (servicesInfo) {
      for (const service of servicesInfo.services) {
        for (const characteristic of service.characteristics) {
          if (
            characteristic.isWritableWithoutResponse ||
            characteristic.isWritableWithResponse
          ) {
            writableCharacteristics.push({
              serviceUUID: service.uuid,
              characteristicUUID: characteristic.uuid,
              withoutResponse: characteristic.isWritableWithoutResponse,
              withResponse: characteristic.isWritableWithResponse,
            });
          }
        }
      }
    }

    return writableCharacteristics;
  }

  // 获取可读的特征值（用于读取数据）
  async getReadableCharacteristics(): Promise<
    Array<{
      serviceUUID: string;
      characteristicUUID: string;
    }>
  > {
    const servicesInfo = await this.getDeviceServicesAndCharacteristics();
    const readableCharacteristics = [];

    if (servicesInfo) {
      for (const service of servicesInfo.services) {
        for (const characteristic of service.characteristics) {
          if (characteristic.isReadable) {
            readableCharacteristics.push({
              serviceUUID: service.uuid,
              characteristicUUID: characteristic.uuid,
            });
          }
        }
      }
    }

    console.log('可读特征值:', readableCharacteristics);
    return readableCharacteristics;
  }

  // 获取可通知的特征值（用于监听数据变化）
  async getNotifiableCharacteristics(): Promise<
    Array<{
      serviceUUID: string;
      characteristicUUID: string;
    }>
  > {
    const servicesInfo = await this.getDeviceServicesAndCharacteristics();
    const notifiableCharacteristics = [];

    if (servicesInfo) {
      for (const service of servicesInfo.services) {
        for (const characteristic of service.characteristics) {
          if (characteristic.isNotifiable || characteristic.isIndicatable) {
            notifiableCharacteristics.push({
              serviceUUID: service.uuid,
              characteristicUUID: characteristic.uuid,
            });
          }
        }
      }
    }

    return notifiableCharacteristics;
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

  // 获取所有已连接的设备
  async getConnectedDevices(): Promise<Device[]> {
    try {
      const connectedDevices = await this.manager.connectedDevices([]);
      console.log(
        '已连接的设备:',
        connectedDevices.map(d => ({ id: d.id, name: d.name })),
      );
      return connectedDevices;
    } catch (error) {
      return [];
    }
  }

  // 强制断开所有已连接的设备
  async disconnectAllDevices(): Promise<void> {
    try {
      const connectedDevices = await this.getConnectedDevices();

      if (connectedDevices.length === 0) {
        console.log('没有已连接的设备');
        return;
      }

      console.log(
        `发现 ${connectedDevices.length} 个已连接的设备，开始断开...`,
      );

      // 并行断开所有设备
      const disconnectPromises = connectedDevices.map(async device => {
        try {
          console.log(`断开设备: ${device.name} (${device.id})`);
          await this.manager.cancelDeviceConnection(device.id);
          console.log(`设备 ${device.name} 已断开`);
        } catch (error) {
          console.error(`断开设备 ${device.name} 失败:`, error);
        }
      });

      await Promise.all(disconnectPromises);

      // 清理本地状态
      this.connectedDevice = null;
      console.log('所有设备已断开连接');
    } catch (error) {
      console.error('断开所有设备失败:', error);
    }
  }

  // 清理并重新初始化（解决连接状态不一致的问题）
  async forceReset(): Promise<boolean> {
    try {
      console.log('开始强制重置蓝牙管理器...');

      // 1. 断开所有设备
      await this.disconnectAllDevices();

      // 2. 停止扫描
      this.manager.stopDeviceScan();

      // 3. 销毁当前管理器
      this.manager.destroy();

      // 4. 等待一小段时间确保资源释放
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      // 5. 重新创建管理器
      this.manager = new BleManager();

      // 6. 重新初始化
      const initialized = await this.initialize();

      if (initialized) {
        console.log('蓝牙管理器重置成功');
      } else {
        console.log('蓝牙管理器重置后初始化失败');
      }

      return initialized;
    } catch (error) {
      console.error('强制重置失败:', error);
      return false;
    }
  }

  // 销毁蓝牙管理器
  destroy(_isCancelledRef: boolean): void {
    try {
      this.isCancelledRef = _isCancelledRef;
      // 先断开当前连接的设备
      if (this.connectedDevice) {
        this.manager
          .cancelDeviceConnection(this.connectedDevice.id)
          .catch(error => {
            console.log('断开连接时出错:', error);
          });
      } else {
        this.disconnectAllDevices();
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
