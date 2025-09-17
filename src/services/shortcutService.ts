import Shortcuts from '@rn-bridge/react-native-shortcuts';
import { Platform, EventSubscription } from 'react-native';

// 定义快捷方式配置类型
export interface ShortcutConfig {
  id: string;
  title: string;
  longLabel?: string;
  subtitle?: string;
  iconName?: string;
}

export class ShortcutService {
  private static instance: ShortcutService;
  private shortcuts: ShortcutConfig[] = [];
  private shortcutListener: EventSubscription | null = null;

  private constructor() {}

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService();
    }
    return ShortcutService.instance;
  }

  /**
   * 检查是否支持快捷方式
   */
  async isShortcutSupported(): Promise<boolean> {
    try {
      return await Shortcuts.isShortcutSupported();
    } catch (error) {
      console.error('❌ 检查快捷方式支持失败:', error);
      return false;
    }
  }

  /**
   * 初始化应用快捷方式
   */
  async initializeShortcuts(): Promise<void> {
    try {
      // 检查设备是否支持快捷方式
      const isSupported = await this.isShortcutSupported();
      if (!isSupported) {
        console.log('⚠️ 设备不支持快捷方式功能');
        return;
      }

      // 创建扫一扫快捷方式配置
      const scanShortcut: ShortcutConfig = {
        id: 'scan_qr_code',
        title: '扫一扫',
        longLabel: '扫描二维码',
        subtitle: '快速扫描二维码',
        iconName: 'ic_scan', // 需要在原生资源中添加图标
      };

      // 添加快捷方式
      const result = await Shortcuts.addShortcut(scanShortcut);
      if (result) {
        this.shortcuts = [scanShortcut];
        console.log('✅ 扫一扫快捷方式创建成功:', result);
      }
    } catch (error) {
      console.error('❌ 快捷方式初始化失败:', error);
    }
  }

  /**
   * 更新快捷方式
   */
  async updateShortcut(config: ShortcutConfig): Promise<void> {
    try {
      const result = await Shortcuts.updateShortcut(config);
      if (result) {
        // 更新本地快捷方式列表
        const index = this.shortcuts.findIndex(s => s.id === config.id);
        if (index !== -1) {
          this.shortcuts[index] = config;
        }
        console.log('✅ 快捷方式更新成功:', result);
      }
    } catch (error) {
      console.error('❌ 快捷方式更新失败:', error);
    }
  }

  /**
   * 删除指定快捷方式
   */
  async removeShortcut(shortcutId: string): Promise<void> {
    try {
      const result = await Shortcuts.removeShortcut(shortcutId);
      if (result) {
        this.shortcuts = this.shortcuts.filter(s => s.id !== shortcutId);
        console.log('✅ 快捷方式删除成功');
      }
    } catch (error) {
      console.error('❌ 快捷方式删除失败:', error);
    }
  }

  /**
   * 清除所有快捷方式
   */
  async clearAllShortcuts(): Promise<void> {
    try {
      const result = await Shortcuts.removeAllShortcuts();
      if (result) {
        this.shortcuts = [];
        console.log('✅ 所有快捷方式清除成功');
      }
    } catch (error) {
      console.error('❌ 快捷方式清除失败:', error);
    }
  }

  /**
   * 检查快捷方式是否存在
   */
  async isShortcutExists(shortcutId: string): Promise<boolean> {
    try {
      return await Shortcuts.isShortcutExists(shortcutId);
    } catch (error) {
      console.error('❌ 检查快捷方式存在性失败:', error);
      return false;
    }
  }

  /**
   * 获取快捷方式详情
   */
  async getShortcutById(shortcutId: string): Promise<any> {
    try {
      return await Shortcuts.getShortcutById(shortcutId);
    } catch (error) {
      console.error('❌ 获取快捷方式详情失败:', error);
      return null;
    }
  }

  /**
   * 获取初始快捷方式ID（应用启动时）
   */
  async getInitialShortcutId(): Promise<string | null> {
    try {
      return await Shortcuts.getInitialShortcutId();
    } catch (error) {
      console.error('❌ 获取初始快捷方式ID失败:', error);
      return null;
    }
  }

  /**
   * 添加快捷方式使用监听器
   */
  addShortcutUsedListener(callback: (shortcutId: string) => void): void {
    try {
      this.shortcutListener = Shortcuts.addOnShortcutUsedListener(callback);
      console.log('✅ 快捷方式监听器已添加');
    } catch (error) {
      console.error('❌ 添加快捷方式监听器失败:', error);
    }
  }

  /**
   * 移除快捷方式监听器
   */
  removeShortcutUsedListener(): void {
    try {
      if (this.shortcutListener) {
        this.shortcutListener.remove();
        this.shortcutListener = null;
        console.log('✅ 快捷方式监听器已移除');
      }
    } catch (error) {
      console.error('❌ 移除快捷方式监听器失败:', error);
    }
  }

  /**
   * 获取当前快捷方式列表
   */
  getShortcuts(): ShortcutConfig[] {
    return this.shortcuts;
  }

  /**
   * 销毁服务（清理资源）
   */
  destroy(): void {
    this.removeShortcutUsedListener();
    this.shortcuts = [];
  }
}

// 导出快捷方式动作常量
export const SHORTCUT_ACTIONS = {
  SCAN_QR_CODE: 'scan_qr_code',
} as const;

export type ShortcutAction = typeof SHORTCUT_ACTIONS[keyof typeof SHORTCUT_ACTIONS];

// 导出单例实例
export const shortcutService = ShortcutService.getInstance();