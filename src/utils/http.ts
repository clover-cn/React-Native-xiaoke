/**
 * HTTP请求工具初始化文件
 * 
 * 使用方式：
 * 1. 在App.tsx或index.js中导入并调用initHttp()
 * 2. 在需要发送请求的地方导入apiService或httpClient
 * 
 * 示例：
 * import { initHttp } from './src/utils/http';
 * import apiService from './src/services/api';
 * 
 * // 初始化
 * initHttp();
 * 
 * // 使用
 * const userInfo = await apiService.getUserInfo();
 */

import { setupInterceptors, setToken, getToken, clearToken } from './interceptors';
import httpClient from './request';
import envConfig from '../config/env';

// 初始化HTTP客户端
export const initHttp = (): void => {
  console.log('🔧 Initializing HTTP client...');
  console.log('🌍 Current environment:', envConfig.CURRENT_ENV);
  console.log('🔗 Base URL:', envConfig.URL);
  
  // 设置拦截器
  setupInterceptors();
  
  console.log('✅ HTTP client initialized successfully');
};

// 导出常用工具
export {
  httpClient,
  setToken,
  getToken,
  clearToken,
};

// 导出环境配置
export { default as envConfig } from '../config/env';

// 导出API服务
export { default as apiService } from '../services/api';

// 导出类型定义
export type {
  RequestConfig,
  ResponseData,
  RequestMethod,
} from './request';

export type {
  User,
  LoginParams,
  LoginResponse,
  Device,
  ScanResult,
  ChargeSession,
  StartChargeParams,
} from '../services/api';

// 快速配置方法
export const configureHttp = (config: {
  baseURL?: string;
  timeout?: number;
  token?: string;
  headers?: Record<string, string>;
}): void => {
  if (config.baseURL || config.timeout || config.headers) {
    httpClient.setConfig({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers,
    });
  }
  
  if (config.token) {
    setToken(config.token);
  }
};

// 环境切换方法（开发时使用）
export const switchEnvironment = (env: 'dev' | 'test' | 'prod' | 'demo'): void => {
  const envUrls = envConfig.ENV_CONFIG[env];
  if (envUrls) {
    httpClient.setConfig({
      baseURL: envUrls.BASE_URL,
    });
    console.log(`🔄 Switched to ${env} environment:`, envUrls.BASE_URL);
  } else {
    console.error('❌ Invalid environment:', env);
  }
};

// 请求状态管理（可选）
class RequestManager {
  private pendingRequests = new Map<string, AbortController>();

  // 添加请求
  addRequest(key: string, controller: AbortController): void {
    this.pendingRequests.set(key, controller);
  }

  // 取消请求
  cancelRequest(key: string): void {
    const controller = this.pendingRequests.get(key);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(key);
    }
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  // 获取待处理请求数量
  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestManager = new RequestManager();

// 默认导出初始化函数
export default initHttp;
