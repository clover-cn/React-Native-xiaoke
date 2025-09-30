import BleManager, {
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleState,
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import type { EventSubscription } from 'react-native';

type Device = Peripheral;

class BluetoothService {
  private connectedDevice: Device | null = null;
  private isCancelledRef = false;
  private isManagerStarted = false;
  private knownDevices = new Map<string, Device>();
  private bluetoothState: BleState = BleState.Unknown;
  private discoverListener: EventSubscription | null = null;
  private stopScanListener: EventSubscription | null = null;
  private stateListener: EventSubscription | null = null;
  private notificationListeners = new Map<string, EventSubscription>();

  constructor() {
    this.ensureStateListener();
  }

  private ensureStateListener(): void {
    if (this.stateListener) {
      return;
    }
    this.stateListener = BleManager.onDidUpdateState(
      (event: { state: BleState }) => {
        this.bluetoothState = event.state;
      },
    );
  }

  private async ensureManagerStarted(): Promise<void> {
    if (this.isManagerStarted) {
      return;
    }
    await BleManager.start({ showAlert: false });
    this.isManagerStarted = true;
    try {
      this.bluetoothState = await BleManager.checkState();
    } catch {
      this.bluetoothState = BleState.Unknown;
    }
  }

  /** 蓝牙初始化*/
  async initialize(): Promise<boolean> {
    try {
      await this.ensureManagerStarted();
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      if (Platform.OS === 'android') {
        try {
          await BleManager.enableBluetooth();
          this.bluetoothState = BleState.On;
        } catch (enableError) {
          console.error('启用蓝牙失败:', enableError);
          Alert.alert('蓝牙未开启', '请开启蓝牙后重试');
          return false;
        }
      } else {
        this.bluetoothState = await BleManager.checkState();
      }

      if (this.bluetoothState !== BleState.On) {
        Alert.alert('蓝牙未开启', '请开启蓝牙后重试');
        return false;
      }

      return true;
    } catch (error) {
      console.error('蓝牙初始化失败:', error);
      return false;
    }
  }

  /**请求权限 */
  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        console.log('开始请求Android权限...');
        console.log('Android版本:', Platform.Version);

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

        if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('位置权限被拒绝');
          Alert.alert(
            '需要位置权限',
            '扫描蓝牙设备需要位置权限。请在设置 > 应用权限中开启位置权限。',
            [{ text: '确定' }],
          );
          return false;
        }

        try {
          console.log('尝试请求蓝牙扫描权限...');
          if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN) {
            const bluetoothScanPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            );
            console.log('蓝牙扫描权限结果:', bluetoothScanPermission);
          }

          if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
            const bluetoothConnectPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            );
            console.log('蓝牙连接权限结果:', bluetoothConnectPermission);
          }
        } catch (bluetoothError) {
          console.log(
            '蓝牙权限请求失败，但位置权限已获得，继续执行:',
            bluetoothError,
          );
        }

        return true;
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

  /**扫描蓝牙 */
  async scanDevices(
    onDeviceFound: (device: Device) => void,
    timeout: number = 10000,
  ): Promise<void> {
    await this.ensureManagerStarted();

    return new Promise((resolve, reject) => {
      let hasFoundDevices = false;
      let isScanning = true;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let settled = false;
      this.isCancelledRef = false;

      const finalize = (shouldResolve: boolean, error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        this.cleanupScanListeners();
        isScanning = false;

        if (shouldResolve) {
          resolve();
        } else {
          const finalError =
            error instanceof Error
              ? error
              : new Error(error ? String(error) : '未找到蓝牙设备');
          reject(finalError);
        }
      };

      this.cleanupScanListeners();

      this.discoverListener = BleManager.onDiscoverPeripheral(
        (peripheral: Peripheral) => {
          this.knownDevices.set(peripheral.id, peripheral);

          if (!isScanning) {
            return;
          }

          if (peripheral.name) {
            hasFoundDevices = true;
            onDeviceFound(peripheral);

            if (this.isCancelledRef) {
              finalize(true);
            }
          }
        },
      );

      this.stopScanListener = BleManager.onStopScan(() => {
        if (!isScanning) {
          return;
        }
        isScanning = false;

        if (this.isCancelledRef || hasFoundDevices) {
          finalize(true);
        } else {
          finalize(false);
        }
      });

      const startScan = async () => {
        try {
          const hasPermissions = await this.requestPermissions();
          if (!hasPermissions) {
            finalize(false, new Error('缺少蓝牙权限'));
            return;
          }

          if (this.bluetoothState !== BleState.On) {
            const initialized = await this.initialize();
            if (!initialized) {
              finalize(false, new Error('蓝牙未开启'));
              return;
            }
          }

          const scanSeconds = Math.max(1, Math.ceil(timeout / 1000));
          await BleManager.scan([], scanSeconds, true);

          timeoutId = setTimeout(() => {
            if (!this.isCancelledRef) {
              console.log(
                `扫描超时：超过 ${timeout} ms 未发现或未取消，准备停止扫描`,
              );
              this.stopScan();
            }
          }, timeout);
        } catch (error: any) {
          console.error('扫描错误:', error);
          finalize(false, error);
        }
      };

      startScan();
    });
  }

  /**停止扫描 */
  stopScan(): void {
    this.isCancelledRef = true;
    BleManager.stopScan().catch(error => {
      console.log('停止扫描时出错:', error);
    });
  }

  /**连接设备 */
  async connectToDevice(
    deviceId: string,
    timeout: number = 10000,
  ): Promise<Device> {
    await this.ensureManagerStarted();

    try {
      await Promise.race([
        BleManager.connect(deviceId),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('连接设备超时'));
          }, timeout);
        }),
      ]);

      let connected: Device =
        this.knownDevices.get(deviceId) ??
        ({
          id: deviceId,
          name: undefined,
          rssi: 0,
          advertising: {},
        } as Device);

      try {
        const info = await BleManager.retrieveServices(deviceId);
        connected = {
          id: info.id,
          name: info.name ?? connected.name,
          rssi: typeof info.rssi === 'number' ? info.rssi : connected.rssi ?? 0,
          advertising: info.advertising ?? connected.advertising ?? {},
        };
      } catch (serviceError) {
        console.error('服务发现失败:', serviceError);
      }

      this.connectedDevice = connected;
      this.knownDevices.set(connected.id, connected);
      return connected;
    } catch (error) {
      console.error('连接设备失败:', error);
      try {
        await BleManager.disconnect(deviceId);
      } catch (cleanupError) {
        console.log('清理连接状态时出错:', cleanupError);
      }
      throw new Error('连接设备失败');
    }
  }

  /**断开设备 */
  async disconnectDevice(): Promise<void> {
    if (!this.connectedDevice) {
      return;
    }

    try {
      await BleManager.disconnect(this.connectedDevice.id);
      this.connectedDevice = null;
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  }

  /**写入数据 */
  async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    data: string,
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      const bytes = this.encodeDataString(data);
      // 简化：直接使用 writeWithoutResponse
      await BleManager.writeWithoutResponse(
        this.connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        bytes,
      );
      console.log('数据发送成功:', data);
    } catch (error: any) {
      console.error('发送数据失败:', error);
      throw error;
    }
  }

  /**读取数据 */
  async readCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    try {
      const value = await BleManager.read(
        this.connectedDevice.id,
        serviceUUID,
        characteristicUUID,
      );
      const base64Value = this.bytesToBase64(value);
      console.log('读取数据成功:', base64Value);
      return base64Value;
    } catch (error: any) {
      console.error('读取数据失败:', error);
      throw error;
    }
  }

  /**监听特征值 */
  async monitorCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    onDataReceived: (data: any) => void,
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('没有连接的设备');
    }

    const deviceId = this.connectedDevice.id;
    const key = this.getNotificationKey(
      deviceId,
      serviceUUID,
      characteristicUUID,
    );
    const existing = this.notificationListeners.get(key);
    if (existing) {
      existing.remove();
      this.notificationListeners.delete(key);
    }

    try {
      await BleManager.startNotification(
        deviceId,
        serviceUUID,
        characteristicUUID,
      );
      // 存储拼接后数据
      let savedHexString = '';
      const subscription = BleManager.onDidUpdateValueForCharacteristic(
        (event: BleManagerDidUpdateValueForCharacteristicEvent) => {
          
          if (
            event.peripheral === deviceId &&
            event.service.toUpperCase() === serviceUUID.toUpperCase() &&
            event.characteristic.toUpperCase() ===
              characteristicUUID.toUpperCase()
          ) {
            console.log('收到数据:', event.value);
            console.log('查看拼接函数是否为空：', savedHexString);

            const { packets, cache } = this.arrayBufferToHex(
              event.value,
              savedHexString,
            );
            savedHexString = cache; // 更新缓存
            packets.forEach(hexString => {
              onDataReceived(hexString);
            });
          }
        },
      );

      this.notificationListeners.set(key, subscription);
    } catch (error: any) {
      console.error('开始监听失败:', error);
      throw error;
    }
  }

  async isDeviceConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      return await BleManager.isPeripheralConnected(this.connectedDevice.id);
    } catch (error) {
      console.error('检查连接状态失败:', error);
      return false;
    }
  }

  /**获取已连接设备 */
  async getConnectedDevices(): Promise<Device[]> {
    try {
      return await BleManager.getConnectedPeripherals([]);
    } catch (error) {
      console.error('获取已连接设备失败:', error);
      return [];
    }
  }

  /**获取设备的所有服务和特征值 */
  async getDeviceServicesAndCharacteristics(deviceId: string): Promise<{
    services: any[];
    characteristics: Array<{
      serviceUUID: string;
      characteristicUUID: string;
      properties: string[];
      descriptors?: any[];
    }>;
  }> {
    try {
      console.log(`获取设备 ${deviceId} 的服务和特征值...`);

      // 获取设备的完整信息
      const peripheralInfo = await BleManager.retrieveServices(deviceId);
      console.log('完整蓝牙设备信息:', peripheralInfo);

      const allCharacteristics: Array<{
        serviceUUID: string;
        characteristicUUID: string;
        properties: string[];
        descriptors?: any[];
      }> = [];

      // 遍历所有服务
      if (peripheralInfo.services) {
        for (const service of peripheralInfo.services) {
          // console.log(`服务: ${service.uuid}`);

          // 获取服务的特征值
          if ((service as any).characteristics) {
            const characteristics = (service as any).characteristics;
            for (const char of characteristics) {
              console.log(
                `  特征值: ${char.characteristic}, 属性: ${char.properties.join(
                  ', ',
                )}`,
              );

              allCharacteristics.push({
                serviceUUID: service.uuid,
                characteristicUUID: char.characteristic,
                properties: char.properties,
                descriptors: char.descriptors || [],
              });
            }
          }
        }
      }

      return {
        services: peripheralInfo.services || [],
        characteristics: allCharacteristics,
      };
    } catch (error) {
      console.error(`获取设备 ${deviceId} 服务和特征值失败:`, error);
      throw error;
    }
  }

  /**获取可写的特征值（用于发送数据） */
  async getWritableCharacteristics(deviceId: string): Promise<
    Array<{
      serviceUUID: string;
      characteristicUUID: string;
      properties: string[];
      writeType: 'write' | 'writeWithoutResponse' | 'both';
    }>
  > {
    try {
      console.log(`获取设备 ${deviceId} 的可写特征值...`);

      const { characteristics } =
        await this.getDeviceServicesAndCharacteristics(deviceId);

      const writableCharacteristics = characteristics
        .filter(char => {
          return char.properties.some(
            prop =>
              prop.toLowerCase().includes('write') ||
              prop.toLowerCase().includes('writewithoutresponse'),
          );
        })
        .map(char => {
          // 确定写入类型
          let writeType: 'write' | 'writeWithoutResponse' | 'both' = 'write';
          const hasWrite = char.properties.some(
            prop => prop.toLowerCase() === 'write',
          );
          const hasWriteWithoutResponse = char.properties.some(
            prop => prop.toLowerCase() === 'writewithoutresponse',
          );

          if (hasWrite && hasWriteWithoutResponse) {
            writeType = 'both';
          } else if (hasWriteWithoutResponse) {
            writeType = 'writeWithoutResponse';
          } else {
            writeType = 'write';
          }

          return {
            serviceUUID: char.serviceUUID,
            characteristicUUID: char.characteristicUUID,
            properties: char.properties,
            writeType,
          };
        });

      console.log(`找到 ${writableCharacteristics.length} 个可写特征值:`);
      writableCharacteristics.forEach(char => {
        console.log(
          `  - ${char.serviceUUID}/${char.characteristicUUID} (${char.writeType})`,
        );
      });

      return writableCharacteristics;
    } catch (error) {
      console.error(`获取设备 ${deviceId} 可写特征值失败:`, error);
      throw error;
    }
  }

  /**获取可读的特征值（用于读取数据） */
  async getReadableCharacteristics(deviceId: string): Promise<
    Array<{
      serviceUUID: string;
      characteristicUUID: string;
      properties: string[];
      canNotify: boolean;
      canIndicate: boolean;
    }>
  > {
    try {
      console.log(`获取设备 ${deviceId} 的可读特征值...`);

      const { characteristics } =
        await this.getDeviceServicesAndCharacteristics(deviceId);

      const readableCharacteristics = characteristics
        .filter(char => {
          return char.properties.some(
            prop =>
              prop.toLowerCase().includes('read') ||
              prop.toLowerCase().includes('notify') ||
              prop.toLowerCase().includes('indicate'),
          );
        })
        .map(char => {
          const canNotify = char.properties.some(
            prop => prop.toLowerCase() === 'notify',
          );
          const canIndicate = char.properties.some(
            prop => prop.toLowerCase() === 'indicate',
          );

          return {
            serviceUUID: char.serviceUUID,
            characteristicUUID: char.characteristicUUID,
            properties: char.properties,
            canNotify,
            canIndicate,
          };
        });

      console.log(`找到 ${readableCharacteristics.length} 个可读特征值:`);
      readableCharacteristics.forEach(char => {
        const capabilities = [];
        if (char.properties.includes('read')) capabilities.push('读取');
        if (char.canNotify) capabilities.push('通知');
        if (char.canIndicate) capabilities.push('指示');

        console.log(
          `  - ${char.serviceUUID}/${
            char.characteristicUUID
          } (${capabilities.join(', ')})`,
        );
      });

      return readableCharacteristics;
    } catch (error) {
      console.error(`获取设备 ${deviceId} 可读特征值失败:`, error);
      throw error;
    }
  }

  /**断开所有设备 */
  async disconnectAllDevices(): Promise<void> {
    try {
      const connectedDevices = await this.getConnectedDevices();

      if (connectedDevices.length === 0) {
        console.log('没有已连接的设备');
        return;
      }

      console.log(`发现${connectedDevices.length}个已连接的设备，开始断开...`);

      await Promise.all(
        connectedDevices.map(async device => {
          try {
            console.log('断开设备');
            await BleManager.disconnect(device.id);
            console.log('设备已断开');
          } catch (error) {
            console.error('断开设备失败', error);
          }
        }),
      );

      this.connectedDevice = null;
      console.log('所有设备已断开连接');
    } catch (error) {
      console.error('断开所有设备失败:', error);
    }
  }

  /**重置蓝牙管理器 */
  async forceReset(): Promise<boolean> {
    try {
      console.log('开始强制重置蓝牙管理器...');

      await this.disconnectAllDevices();

      this.stopScan();

      this.cleanupNotificationListeners();
      this.cleanupScanListeners();
      this.knownDevices.clear();
      this.connectedDevice = null;

      await new Promise<void>(resolve => setTimeout(resolve, 500));

      await this.ensureManagerStarted();
      const state = await BleManager.checkState();

      if (state === BleState.On) {
        console.log('蓝牙管理器重置成功');
        return true;
      }

      console.log('蓝牙管理器重置后初始化失败');
      return false;
    } catch (error) {
      console.error('强制重置失败:', error);
      return false;
    }
  }

  /** 关闭蓝牙 */
  destroy(isCancelledRef: boolean): void {
    try {
      this.isCancelledRef = isCancelledRef;

      if (this.connectedDevice) {
        BleManager.disconnect(this.connectedDevice.id).catch(error => {
          console.log('断开连接时出错:', error);
        });
      } else {
        this.disconnectAllDevices();
      }

      this.stopScan();
      this.cleanupNotificationListeners();
      this.cleanupScanListeners();

      this.connectedDevice = null;
    } catch (error) {
      console.error('销毁蓝牙管理器时出错:', error);
    }
  }

  private cleanupScanListeners(): void {
    if (this.discoverListener) {
      this.discoverListener.remove();
      this.discoverListener = null;
    }
    if (this.stopScanListener) {
      this.stopScanListener.remove();
      this.stopScanListener = null;
    }
  }

  private cleanupNotificationListeners(): void {
    this.notificationListeners.forEach(subscription => {
      subscription.remove();
    });
    this.notificationListeners.clear();
  }

  private encodeDataString(input: string): number[] {
    const trimmed = input.replace(/\s+/g, '');
    if (/^[0-9A-Fa-f]+$/.test(trimmed) && trimmed.length % 2 === 0) {
      const bytes: number[] = [];
      for (let i = 0; i < trimmed.length; i += 2) {
        bytes.push(parseInt(trimmed.substring(i, i + 2), 16));
      }
      return bytes;
    }

    if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
      try {
        return this.base64ToBytes(trimmed);
      } catch (error) {
        console.log('Base64 转换失败，回退为 UTF-8:', error);
      }
    }

    return this.stringToUtf8Bytes(input);
  }

  private stringToUtf8Bytes(value: string): number[] {
    const utf8 = encodeURIComponent(value).replace(
      /%([0-9A-F]{2})/g,
      (_, hex) => String.fromCharCode(parseInt(hex, 16)),
    );
    const bytes: number[] = [];
    for (let i = 0; i < utf8.length; i += 1) {
      bytes.push(utf8.charCodeAt(i));
    }
    return bytes;
  }

  private base64ToBytes(base64: string): number[] {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const bytes: number[] = [];
    let i = 0;

    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    while (i < base64.length) {
      const enc1 = chars.indexOf(base64.charAt(i++));
      const enc2 = chars.indexOf(base64.charAt(i++));
      const enc3 = chars.indexOf(base64.charAt(i++));
      const enc4 = chars.indexOf(base64.charAt(i++));

      // eslint-disable-next-line no-bitwise
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      // eslint-disable-next-line no-bitwise
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      // eslint-disable-next-line no-bitwise
      const chr3 = ((enc3 & 3) << 6) | enc4;

      bytes.push(chr1);

      if (enc3 !== 64) {
        bytes.push(chr2);
      }
      if (enc4 !== 64) {
        bytes.push(chr3);
      }
    }

    return bytes;
  }

  /** 字节转Base64 */
  private bytesToBase64(bytes: number[]): string {
    if (!bytes || bytes.length === 0) {
      return '';
    }

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;

    while (i < bytes.length) {
      const chr1 = bytes[i++];
      const chr2 = i < bytes.length ? bytes[i++] : NaN;
      const chr3 = i < bytes.length ? bytes[i++] : NaN;

      // eslint-disable-next-line no-bitwise
      const enc1 = chr1 >> 2;
      // eslint-disable-next-line no-bitwise
      const enc2 =
        ((chr1 & 3) << 4) | (isNaN(chr2) ? 0 : (chr2 as number) >> 4);
      const enc3 = isNaN(chr2)
        ? 64
        : // eslint-disable-next-line no-bitwise
          (((chr2 as number) & 15) << 2) |
          (isNaN(chr3) ? 0 : ((chr3 as number) >> 6) & 3);
      // eslint-disable-next-line no-bitwise
      const enc4 = isNaN(chr3) ? 64 : (chr3 as number) & 63;

      output +=
        chars.charAt(enc1) +
        chars.charAt(enc2) +
        chars.charAt(enc3) +
        chars.charAt(enc4);
    }

    return output;
  }

  private getNotificationKey(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): string {
    return [peripheralId, serviceUUID, characteristicUUID].join(':');
  }

  /**字节转十六进制 */
  private arrayBufferToHex(arrayBuffer: any, cache: string) {
    const byteArray = new Uint8Array(arrayBuffer);
    let hexString = '';
    for (let i = 0; i < byteArray.length; i++) {
      hexString += byteArray[i].toString(16).padStart(2, '0');
    }
    hexString = cache + hexString;

    // 修复：使用贪婪匹配，并且更精确地匹配完整数据包
    // 数据包格式：7B + 数据 + 7D，数据中可能包含7D，所以需要找到真正的结束7D
    let results = [];
    let lastIndex = 0;
    let startIndex = 0;

    while (startIndex < hexString.length) {
      // 查找7B开始标记
      let start = hexString.indexOf('7b', startIndex);
      if (start === -1) break;

      // 从7B后面开始查找7D结束标记
      let end = start + 2; // 跳过7B
      let foundEnd = false;

      while (end < hexString.length - 1) {
        if (hexString.substring(end, end + 2).toLowerCase() === '7d') {
          // 找到可能的结束标记，检查这个数据包是否完整
          let potentialPacket = hexString.substring(start, end + 2);
          let data = potentialPacket.slice(2, -2); // 去除7B和7D

          // 检查CRC校验
          if (this.crc16Modbus(data) === '0000') {
            // CRC校验成功，这是一个完整的数据包
            results.push(potentialPacket);
            lastIndex = end + 2;
            foundEnd = true;
            break;
          }
        }
        end += 2; // 每次移动一个字节（2个十六进制字符）
      }

      if (!foundEnd) {
        // 没有找到有效的结束标记，可能是不完整的数据包
        break;
      }

      startIndex = lastIndex;
    }

    // 如果没有找到完整的数据包，但缓存中有完整的数据包，尝试验证整个缓存
    if (results.length === 0 && hexString.length > 4) {
      if (hexString.startsWith('7b') && hexString.endsWith('7d')) {
        let data = hexString.slice(2, -2);
        if (this.crc16Modbus(data) === '0000') {
          console.log('缓存CRC校验成功准备返回======>', hexString);
          return {
            packets: [hexString],
            cache: '',
          };
        }
      }
    }

    // 返回完整包和剩余缓存
    return {
      packets: results,
      cache: hexString.slice(lastIndex),
    };
  }

  /**crc16计算 */
  private crc16Modbus(hexString: string) {
    // 将十六进制字符串转换为字节数组
    var byteArray = [];
    for (var i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    var crc = 0xffff;
    var i: number, j: number;
    for (i = 0; i < byteArray.length; i++) {
      crc ^= byteArray[i];
      for (j = 0; j < 8; j++) {
        if (crc & 0x0001) {
          crc = (crc >> 1) ^ 0xa001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    // 将结果拆分为低字节和高字节
    var crcLow = crc & 0xff;
    var crcHigh = (crc >> 8) & 0xff;
    // 返回校验结果，低位在前高位在后，格式化为十六进制字符串
    return (
      crcLow.toString(16).toUpperCase().padStart(2, '0') +
      crcHigh.toString(16).toUpperCase().padStart(2, '0')
    );
  }
}

export type { Device };
export default BluetoothService;
