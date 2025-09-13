// 通用本地存储封装（基于 react-native-mmkv）
// 说明：提供同步 API，供各处统一调用：storage.set/get/delete
import { MMKV } from 'react-native-mmkv';

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
