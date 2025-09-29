// 通用本地存储封装（基于 react-native-mmkv）
// 说明：提供同步 API，供各处统一调用：storage.set/get/delete
import { MMKV } from 'react-native-mmkv';
import { ComputeType, ComputeResult } from '../types/commonType';
import { ToastAndroid } from 'react-native';
import apiService from '../services/api';
import BluetoothService from '../services/bluetoothService';

// 创建蓝牙服务单例实例
let bluetoothService = new BluetoothService();
// 单例存储实例（如需分命名空间，可新建不同 id 的 MMKV 实例）
const mmkv = new MMKV();

export type StorageGetType = 'string' | 'number' | 'boolean';

export const storage = {
  // 设置键值（同步）
  set(key: string, value: string | number | boolean): void {
    mmkv.set(key, value as any);
  },

  // 读取键值（同步），默认按 string 读取，读取失败返回 null
  get(
    key: string,
    type: StorageGetType = 'string',
  ): string | number | boolean | null {
    switch (type) {
      case 'number': {
        const v = mmkv.getNumber(key);
        return typeof v === 'number' && !Number.isNaN(v) ? v : null;
      }
      case 'boolean': {
        const v = mmkv.getBoolean(key) as boolean | undefined;
        // 若类型系统认为可能为 undefined，则统一转为 null
        return typeof v === 'boolean' ? v : null;
      }
      case 'string':
      default: {
        return mmkv.getString(key) ?? null;
      }
    }
  },

  // 删除键（同步）
  delete(key: string): void {
    mmkv.delete(key);
  },
};

export default storage;

/**
 * @param {*} timestamp
 * @explain 将时间戳格式化为日期时间字符串(精确到秒)
 */
export function formatTimestamp(timestamp?: number | string | Date): string {
  if (timestamp === undefined || timestamp === null || timestamp === '')
    return '-';

  let ms: number;
  if (timestamp instanceof Date) {
    ms = timestamp.getTime();
  } else {
    const n = Number(timestamp);
    if (!Number.isFinite(n)) return '-';
    ms = n;
  }

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 数字运算（主要用于小数点精度问题）
 * @param a 前面的值 - 支持number、string类型
 * @param type 计算方式
 * @param b 后面的值 - 支持number、string类型
 * @param decimals 保留小数位数（undefined表示不做处理）
 * @param padZero 是否补零
 * @example
 * ```js
 * // 可链式调用，支持字符串输入
 * const res = computeNumber("1.3", "-", "1.2").next("+", 1.5).next("*", "2.3").next("/", 0.2).result;
 * console.log(res);
 * ```
 */
export function computeNumber(
  a: number | string | null | undefined,
  type: ComputeType,
  b: number | string | null | undefined,
  decimals?: number,
  padZero: boolean = false,
): ComputeResult {
  /**
   * 将输入值转换为数字
   * @param value 输入值
   * @returns 转换后的数字，如果转换失败返回NaN
   */
  const toNumber = (value: number | string | null | undefined): number => {
    if (value == null) return NaN;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return NaN;
      const num = parseFloat(trimmed);
      return isNaN(num) ? NaN : num;
    }
    return NaN;
  };

  const numA = toNumber(a);
  const numB = toNumber(b);

  if (isNaN(numA)) {
    return {
      result: padZero && decimals !== undefined ? (0).toFixed(decimals) : 0,
      next: (nextType: ComputeType, nextValue: number | string) =>
        computeNumber(0, nextType, nextValue, decimals, padZero),
    };
  }

  if (isNaN(numB)) {
    return {
      result: padZero && decimals !== undefined ? numA.toFixed(decimals) : numA,
      next: (nextType: ComputeType, nextValue: number | string) =>
        computeNumber(numA, nextType, nextValue, decimals, padZero),
    };
  }

  /**
   * 获取数字小数点的长度
   * @param n 数字
   */
  function getDecimalLength(n: number): number {
    const decimal = n.toString().split('.')[1];
    return decimal ? decimal.length : 0;
  }

  /**
   * 修正小数点
   * @description 防止出现 `33.33333*100000 = 3333332.9999999995` && `33.33*10 = 333.29999999999995` 这类情况做的处理
   * @param n 需要修正的数字
   * @param precision 精度
   */
  const amend = (n: number, precision: number = 15): number =>
    parseFloat(Number(n).toPrecision(precision));

  /**
   * 格式化数字
   * @param n 需要格式化的数字
   * @returns 格式化后的数字
   */
  const formatNumber = (n: number): string | number => {
    if (decimals === undefined) return n;
    // 对所有数字统一使用 toFixed 处理
    if (padZero) {
      return n.toFixed(decimals);
    } else {
      // 不补零的情况，但仍然保持指定小数位
      const factor = Math.pow(10, decimals);
      return parseFloat((Math.round(n * factor) / factor).toFixed(decimals));
    }
  };

  const power = Math.pow(
    10,
    Math.max(getDecimalLength(numA), getDecimalLength(numB)),
  );
  let result = 0;
  const amendedA = amend(numA * power);
  const amendedB = amend(numB * power);

  switch (type) {
    case '+':
      result = (amendedA + amendedB) / power;
      break;
    case '-':
      result = (amendedA - amendedB) / power;
      break;
    case '*':
      result = (amendedA * amendedB) / (power * power);
      break;
    case '/':
      if (amendedB === 0) {
        throw new Error('Division by zero is not allowed');
      }
      result = amendedA / amendedB;
      break;
  }

  const finalResult = formatNumber(amend(result));

  return {
    /** 计算结果 */
    result: finalResult,
    /**
     * 继续计算
     * @param nextType 继续计算方式
     * @param nextValue 继续计算的值
     */
    next(nextType: ComputeType, nextValue: number | string): ComputeResult {
      if (nextValue == null) {
        return {
          result: padZero && decimals !== undefined ? (0).toFixed(decimals) : 0,
          next: (type: ComputeType, value: number | string) =>
            computeNumber(0, type, value, decimals, padZero),
        };
      }
      const currentResult =
        typeof finalResult === 'string' ? parseFloat(finalResult) : finalResult;
      return computeNumber(
        currentResult,
        nextType,
        nextValue,
        decimals,
        padZero,
      );
    },
  };
}

/**
 * 查询设备信息
 */
export function getDeviceinfo(devNo: string) {
  return new Promise((resolve, reject) => {
    apiService
      .getDeviceInfo(devNo)
      .then(res => {
        console.log('?????????', res);

        if (res.onlineState === '0' && res.state === '0') {
          console.log('设备在线，状态正常');
          resolve(true);
        } else if (res.onlineState === '0' && res.state === '1') {
          console.log('设备在线，免费模式');
          resolve(2);
        } else if (res.onlineState === '0' && res.state === '2') {
          console.log('设备在线，维护模式');
          ToastAndroid.show('设备维护中！', ToastAndroid.SHORT);
          resolve(2);
        } else if (res.onlineState === '1' && res.state === '0') {
          console.log('设备离线，状态正常');
          resolve(false);
        } else if (res.onlineState === '1' && res.state === '1') {
          console.log('设备离线，免费模式');
          resolve(2);
        } else if (res.onlineState === '1' && res.state === '2') {
          console.log('设备离线，维护模式');
          ToastAndroid.show('设备维护中！', ToastAndroid.SHORT);
          resolve(2);
        } else {
          // reject(res.data)
          reject(new Error('设设备状态异常，请联系管理员！'));
          ToastAndroid.show('设备状态异常，请联系管理员！', ToastAndroid.SHORT);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 断开蓝牙连接
 */
export function destroy() {
  bluetoothService.destroy(true);
}

/**
 * 初始化蓝牙
 */
export function InitialBluetooth(mac: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let bluetoothId = '';
      if (mac) {
        bluetoothId =
          mac.slice(0, 2) +
          ':' +
          mac.slice(2, 4) +
          ':' +
          mac.slice(4, 6) +
          ':' +
          mac.slice(6, 8) +
          ':' +
          mac.slice(8, 10) +
          ':' +
          mac.slice(10, 12);
        console.log('转换后的蓝牙id', bluetoothId);
      }
      console.log('初始化蓝牙');

      // 确保有可用的蓝牙服务实例
      if (!bluetoothService) {
        bluetoothService = new BluetoothService();
      }

      let res = await bluetoothService.initialize();
      console.log('初始化蓝牙结果:', res);

      // 722蓝牙
      let ServiceID_722 = '0000FEE9-0000-1000-8000-00805F9B34FB'; //蓝牙模块固定服务ID
      let WriteCharacteristicUUID_722 = 'D44BC439-ABFD-45A2-B575-925416129600'; // 可写特征值uuid
      let NotifyCharacteristicUUID_722 = 'D44BC439-ABFD-45A2-B575-925416129601'; // 通知特征值UUID
      // 9141蓝牙模块
      let ServiceID_9141 = '0000FFF0-0000-1000-8000-00805F9B34FB'; //蓝牙模块固定服务ID
      let WriteCharacteristicUUID_9141 = '0000FFF1-0000-1000-8000-00805F9B34FB'; // 可写特征值uuid
      let NotifyCharacteristicUUID_9141 =
        '0000FFF2-0000-1000-8000-00805F9B34FB'; // 通知特征值UUID

      if (res) {
        await bluetoothService.scanDevices(async e => {
          console.log('扫描到设备:', e);
          if (mac && e.id === bluetoothId) {
            bluetoothService.stopScan();
            console.log('找到目标设备，停止扫描', e.id);
            let res = await bluetoothService.connectToDevice(e.id);
            console.log('连接设备结果:', res);
            // // 获取可写特征值（用于发送数据）
            // const writableChars =
            //   await bluetoothService.getWritableCharacteristics();
            // console.log('可写特征值:', writableChars);

            // // 获取可通知特征值（用于监听数据）
            // const notifiableChars =
            //   await bluetoothService.getNotifiableCharacteristics();
            // console.log('可通知特征值:', notifiableChars);

            // 获取设备的所有服务和特征值
            const allServicesAndChars =
              await bluetoothService.getDeviceServicesAndCharacteristics();
            console.log('设备的所有服务和特征值:', allServicesAndChars);
            let uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';
            let filteredArray = allServicesAndChars?.services.filter(
              item => item.uuid.toLowerCase() === uuid.toLowerCase(),
            );
            console.log('筛选结果:', filteredArray);
            
            if (filteredArray && filteredArray.length > 0) {
              console.log('9141蓝牙模块');
              bluetoothService.monitorCharacteristic(ServiceID_9141,WriteCharacteristicUUID_9141,(e) => {
                console.log('监听到数据:', e);
              })

              // const hexString2 = '7B863313061984905000280041DC7D'; // 示例十六进制字符串
              // let data = await bluetoothService.writeCharacteristic(ServiceID_9141,WriteCharacteristicUUID_9141,hexString2)
              // console.log('写入数据结果:', data);
              
            } else {
              console.log('722蓝牙模块');
            }
          }
        });
        resolve(res);
      } else {
        reject(new Error('蓝牙初始化失败'));
      }
    } catch (error) {
      console.error('InitialBluetooth 出错:', error);
      reject(error);
    }
  });
}
