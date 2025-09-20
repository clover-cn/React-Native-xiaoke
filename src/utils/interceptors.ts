import { Alert, ToastAndroid } from 'react-native';
import httpClient, { RequestConfig } from './request';

// 使用公共封装的 storage（基于 MMKV）
import storage from './Common';
// 导入导航服务
import { navigationRef } from '../services/navigationService';

// token 键名（局部常量，按需跨模块可提升至 Common.ts）
const TOKEN_KEY = 'APP_AUTH_TOKEN';

class BusinessError<T = unknown> extends Error {
  public code: number;

  public payload: T;

  constructor(code: number, message: string, payload: T) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.payload = payload;
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

// 设置 token（同步）
export const setToken = (token: string): void => {
  storage.set(TOKEN_KEY, token);
};

// 获取 token（同步），不存在时返回 null
export const getToken = (): string | null => {
  const v = storage.get(TOKEN_KEY, 'string');
  return typeof v === 'string' ? v : null;
};

// 清除 token（同步）
export const clearToken = (): void => {
  storage.delete(TOKEN_KEY);
};

// 请求拦截器：添加认证token
const authRequestInterceptor = (config: RequestConfig): RequestConfig => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// 请求拦截器：添加公共参数
const commonRequestInterceptor = (config: RequestConfig): RequestConfig => {
  // 添加时间戳防止缓存
  const timestamp = Date.now();
  const separator = config.url.includes('?') ? '&' : '?';
  config.url = `${config.url}${separator}_t=${timestamp}`;

  // 添加公共请求头
  config.headers = {
    ...config.headers,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
    'X-Platform': 'react-native',
  };

  return config;
};

// 请求拦截器：日志记录
const loggingRequestInterceptor = (config: RequestConfig): RequestConfig => {
  console.log('🚀 请求拦截器日志记录:', config);
  return config;
};

// 响应拦截器：处理成功响应中的业务错误码（处理业务错误码）
const commonResponseInterceptor = async (
  response: Response,
): Promise<Response> => {
  console.log('✅ 响应拦截器日志记录:', {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  });

  // 如果不是成功的HTTP状态码，直接返回让errorInterceptor处理
  if (!response.ok) {
    return response;
  }

  // 克隆响应以便多次读取
  const clonedResponse = response.clone();

  try {
    const data = await clonedResponse.json();
    // console.log('响应数据:', data);

    // 只处理成功HTTP响应中的业务错误码
    if (data.code && data.code != 200 && data.code != 0) {
      const businessMessage = data.message || data.msg || 'Unknown error';
      console.warn('⚠️ Business Error:', businessMessage);

      // 根据错误码进行不同处理
      switch (data.code) {
        case 401:
          // 未授权，清除token并跳转登录
          ToastAndroid.show('登录已过期，请重新登录', ToastAndroid.SHORT);
          clearToken();
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }, 100);
          break;
        case 403:
          Alert.alert('提示', '没有权限访问该资源');
          navigationRef.goBack();
          break;
        default:
          if (businessMessage) {
            Alert.alert('提示', businessMessage);
          }
      }

      throw new BusinessError(data.code, businessMessage, data);
    }
  } catch (error) {
    // 如果已经是BusinessError，直接抛出
    if (error instanceof BusinessError) {
      throw error;
    }
    // 响应不是JSON格式，直接返回原响应
    console.log('响应不是JSON格式');
  }

  return response;
};

// 错误拦截器：统一处理HTTP状态码错误和网络错误（处理HTTP状态码错误）
const errorInterceptor = async (error: Error): Promise<never> => {
  console.error('❌ 请求错误:', error);

  // 如果是业务错误，直接重新抛出
  if (error instanceof BusinessError) {
    throw error;
  }

  let errorMessage = '网络请求失败';

  // 处理网络错误
  if (error.name === 'AbortError') {
    errorMessage = '请求超时，请检查网络连接';
  } else if (error.message.includes('Network request failed')) {
    errorMessage = '网络连接失败，请检查网络设置';
  } else if (error.message.includes('HTTP Error')) {
    // 处理HTTP状态码错误
    const statusMatch = error.message.match(/HTTP Error: (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      switch (status) {
        case 401:
          // HTTP状态码401，清除token并跳转登录
          ToastAndroid.show('登录已过期，请重新登录', ToastAndroid.SHORT);
          clearToken();
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }, 100);
          throw error; // 不显示额外的Toast
        case 403:
          errorMessage = '没有权限访问该资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务暂时不可用';
          break;
        default:
          errorMessage = `服务器错误 (${status})`;
      }
    }
  }

  // 显示错误提示
  ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
  throw error;
};

// 初始化拦截器
export const setupInterceptors = (): void => {
  // 添加请求拦截器（按顺序执行）
  httpClient.addRequestInterceptor(loggingRequestInterceptor);
  httpClient.addRequestInterceptor(commonRequestInterceptor);
  httpClient.addRequestInterceptor(authRequestInterceptor);

  // 添加响应拦截器
  httpClient.addResponseInterceptor(commonResponseInterceptor);

  // 添加错误拦截器
  httpClient.addErrorInterceptor(errorInterceptor);
};

// 创建不同服务的请求实例
export const createServiceClient = (baseURL: string) => {
  const { HttpClient } = require('./request');
  const client = new HttpClient();
  client.setConfig({ baseURL });

  // 为特定服务添加拦截器
  client.addRequestInterceptor(loggingRequestInterceptor);
  client.addRequestInterceptor(commonRequestInterceptor);
  client.addRequestInterceptor(authRequestInterceptor);
  client.addResponseInterceptor(commonResponseInterceptor);
  client.addErrorInterceptor(errorInterceptor);

  return client;
};

// 导出预配置的服务客户端
import envConfig from '../config/env';

export const drsClient = createServiceClient(envConfig.DRS_URL);
export const backupClient = createServiceClient(envConfig.BACKUP_URL);
