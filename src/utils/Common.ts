// 通用本地存储封装（基于 react-native-mmkv）
// 说明：提供同步 API，供各处统一调用：storage.set/get/delete
import { MMKV } from 'react-native-mmkv';
import { ComputeType, ComputeResult } from '../types/commonType';
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
