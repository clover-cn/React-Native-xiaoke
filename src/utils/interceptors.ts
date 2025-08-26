import { Alert } from 'react-native';
import httpClient, { RequestConfig } from './request';

// 存储token的key
const TOKEN_KEY = 'user_token';

// 模拟token存储（实际项目中应该使用AsyncStorage）
let userToken: string | null = null;

// 设置token
export const setToken = (token: string): void => {
  userToken = token;
  // 实际项目中应该使用AsyncStorage.setItem(TOKEN_KEY, token);
};

// 获取token
export const getToken = (): string | null => {
  return userToken;
  // 实际项目中应该使用AsyncStorage.getItem(TOKEN_KEY);
};

// 清除token
export const clearToken = (): void => {
  userToken = null;
  // 实际项目中应该使用AsyncStorage.removeItem(TOKEN_KEY);
};

// 请求拦截器：添加认证token
const authRequestInterceptor = (config: RequestConfig): RequestConfig => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
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
  console.log('🚀 Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  return config;
};

// 响应拦截器：处理通用响应
const commonResponseInterceptor = async (response: Response): Promise<Response> => {
  console.log('📥 Response:', {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  });

  // 克隆响应以便多次读取
  const clonedResponse = response.clone();
  
  try {
    const data = await clonedResponse.json();
    console.log('📄 Response Data:', data);
    
    // 处理业务错误码
    if (data.code && data.code !== 200 && data.code !== 0) {
      console.warn('⚠️ Business Error:', data.message || 'Unknown error');
      
      // 根据错误码进行不同处理
      switch (data.code) {
        case 401:
          // 未授权，清除token并跳转登录
          clearToken();
          Alert.alert('提示', '登录已过期，请重新登录');
          // 这里可以添加跳转到登录页面的逻辑
          break;
        case 403:
          Alert.alert('提示', '没有权限访问该资源');
          break;
        case 500:
          Alert.alert('提示', '服务器内部错误，请稍后重试');
          break;
        default:
          if (data.message) {
            Alert.alert('提示', data.message);
          }
      }
    }
  } catch (error) {
    console.log('Response is not JSON format');
  }

  return response;
};

// 错误拦截器：处理网络错误
const errorInterceptor = async (error: Error): Promise<never> => {
  console.error('❌ Request Error:', error);

  let errorMessage = '网络请求失败';

  if (error.name === 'AbortError') {
    errorMessage = '请求超时，请检查网络连接';
  } else if (error.message.includes('Network request failed')) {
    errorMessage = '网络连接失败，请检查网络设置';
  } else if (error.message.includes('HTTP Error')) {
    const statusMatch = error.message.match(/HTTP Error: (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      switch (status) {
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
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
  Alert.alert('网络错误', errorMessage);

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
