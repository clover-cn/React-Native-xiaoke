// 通用本地存储封装（基于 react-native-mmkv）
// 说明：提供同步 API，供各处统一调用：storage.set/get/delete
import { MMKV } from 'react-native-mmkv';
import { ComputeType, ComputeResult } from '../types/commonType';
import { ToastAndroid } from 'react-native';
import apiService from '../services/api';
import { bluetoothService } from '../services/bluetoothService';
import globalData from './globalData';
// 复用全局蓝牙服务单例实例
// 单例存储实例（如需分命名空间，可新建不同 id 的 MMKV 实例）
const mmkv = new MMKV();
let shouldContinueCheck = false;
let excludeConsumeId = ''; // 用于存储上报订单时排除的订单ID
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

/**字节转十六进制 */
function arrayBufferToHex(arrayBuffer: any, cache: string) {
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
        if (crc16Modbus(data) === '0000') {
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
      if (crc16Modbus(data) === '0000') {
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
export function crc16Modbus(hexString: string) {
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

/**
 * 初始化蓝牙
 */
export function InitialBluetooth(
  mac: string,
  deviceNo: string,
  excludeId = '',
) {
  return new Promise(async (success, reject) => {
    try {
      let bluetoothId = '';
      excludeConsumeId = excludeId;
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
      await bluetoothService.initialize();
      await bluetoothService.scanDevices(async e => {
        console.log('搜索到的蓝牙设备', e);
        if (e.id === bluetoothId) {
          console.log('找到了目标蓝牙设备，准备连接...');

          bluetoothService.stopScan();
          try {
            const res = await bluetoothService.connectToDevice(bluetoothId);
            console.log('连接蓝牙结果', res);
            const res2 =
              await bluetoothService.getDeviceServicesAndCharacteristics(
                bluetoothId,
              );
            console.log('设备全部特征值', res2);
            // let uuid = '0000FFF0-0000-1000-8000-00805F9B34FB';
            const uuid = 'FFF0';
            const filteredArray = res2.services.filter(
              item => item.uuid.toLowerCase() === uuid.toLowerCase(),
            );
            console.log('过滤后的特征值', filteredArray);
            if (filteredArray.length > 0) {
              console.log('9141蓝牙模块');
              globalData.bluetooth_9141 = true;

              // 然后手动控制通知的启用/禁用
              // await bluetoothService.notifyBLECharacteristicValueChange(
              //   globalData.serviceID,
              //   globalData.notifyCharacteristicUUID,
              //   true, // 需要接收数据时启用
              // );

              shouldContinueCheck = true;
              visitationBluetoothValue(mac, deviceNo, success); // 同步调用
            } else {
              console.log('722蓝牙模块');
            }
          } catch (err: any) {
            console.error('连接或获取服务失败:', err);
            // 抛出让 scanDevices 捕获并 reject，从而被 InitialBluetooth 外层 try/catch 捕获
            throw (err instanceof Error ? err : new Error(String(err)));
          }
        }
      });
    } catch (error) {
      console.error('InitialBluetooth 出错:', error);
      reject(error);
    }
  });
}

/**
 * 开始巡检
 * @param mac
 * @param deviceNo
 */
async function visitationBluetoothValue(
  mac: string,
  deviceNo: string,
  success: any,
) {
  console.log('开始巡检');
  let res = await apiService.agreementGather(deviceNo);
  console.log('巡检结果', res);

  await bluetoothService.monitorCharacteristic(
    globalData.serviceID,
    globalData.notifyCharacteristicUUID,
    hexString => {
      console.log('监听到蓝牙数据', hexString);
      if (hexString.startsWith('7b') && hexString.endsWith('7d')) {
        let data = hexString.slice(2, -2);
        if (crc16Modbus(data) == '0000') {
          console.log('CRC校验成功======>', hexString);
          if (data.includes('2a01')) {
            delBluetoothOrders(data, deviceNo, success);
          }
        }
      }
    },
    true, // 设置为 false，不自动启用通知
  );
  await bluetoothService.writeCharacteristic(
    globalData.serviceID,
    globalData.writeCharacteristicUUID,
    res,
  );
}

/**
 * 删除蓝牙订单
 * @param data
 * @param deviceNo
 */
async function delBluetoothOrders(
  data: string,
  deviceNo: string,
  success: any,
) {
  let reqData = {
    devNo: deviceNo,
    encodeNotice: data,
    excludeConsumeId: excludeConsumeId,
  };
  let res: any = await apiService.postCompleteNotice(reqData);
  console.log('删除订单结果', res);
  if (res.isEnd) {
    shouldContinueCheck = false;
    console.log('蓝牙启动前巡检数据完毕');
    //取消所有监听事件
    bluetoothService.offBLECharacteristicValueChange();
    console.log('准备发送随机数');
    random(deviceNo, success);
  } else {
    shouldContinueCheck = true;
    // 取消所有监听事件
    bluetoothService.offBLECharacteristicValueChange();
    await bluetoothService.writeCharacteristic(
      globalData.serviceID,
      globalData.writeCharacteristicUUID,
      res.encodeAnswer,
    );
  }
}

async function random(devNo: string, success: any) {
  try {
    let reqData = {
      devNo,
      orderId: excludeConsumeId,
    };
    const res = await apiService.postAgreementConsumer(reqData);
    console.log('获取的随机数 code=', res);
    await bluetoothService.monitorCharacteristic(
      globalData.serviceID,
      globalData.notifyCharacteristicUUID,
      hexString => {
        console.log('监听到蓝牙数据', hexString);
        if (hexString.startsWith('7b') && hexString.endsWith('7d')) {
          let data = hexString.slice(2, -2);
          if (crc16Modbus(data) == '0000') {
            console.log('CRC校验成功======>', hexString);
            success(data)
          }
        }
      },
      true, // 设置为 false，不自动启用通知
    );
    await bluetoothService.writeCharacteristic(
      globalData.serviceID,
      globalData.writeCharacteristicUUID,
      res,
    );
  } catch (error: any) {
    console.log('获取随机数错误', error);
    ToastAndroid.show(
      error.msg || error.message || '获取随机数失败',
      ToastAndroid.SHORT,
    );
  }
}
