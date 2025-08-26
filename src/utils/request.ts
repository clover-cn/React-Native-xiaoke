import envConfig from '../config/env';

// 请求方法类型
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置接口
export interface RequestConfig {
  url: string;
  method?: RequestMethod;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
}

// 响应数据接口
export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 请求拦截器类型
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// 响应拦截器类型
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// 错误拦截器类型
export type ErrorInterceptor = (error: Error) => Promise<never> | Error;

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor() {
    this.baseURL = envConfig.URL;
    this.timeout = 10000; // 默认10秒超时
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // 设置默认配置
  setConfig(config: Partial<{ baseURL: string; timeout: number; headers: Record<string, string> }>): void {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.timeout) this.timeout = config.timeout;
    if (config.headers) this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
  }

  // 处理请求拦截器
  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  // 处理响应拦截器
  private async processResponseInterceptors(response: Response): Promise<Response> {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  // 处理错误拦截器
  private async processErrorInterceptors(error: Error): Promise<never> {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      const result = await interceptor(processedError);
      if (result instanceof Error) {
        processedError = result;
      }
    }
    throw processedError;
  }

  // 创建超时控制器
  private createTimeoutController(timeout: number): { controller: AbortController; timeoutId: number } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    return { controller, timeoutId };
  }

  // 构建完整URL
  private buildURL(url: string, baseURL?: string): string {
    const base = baseURL || this.baseURL;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  // 核心请求方法
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    try {
      // 处理请求拦截器
      const processedConfig = await this.processRequestInterceptors(config);
      
      const {
        url,
        method = 'GET',
        data,
        headers = {},
        timeout = this.timeout,
        baseURL,
      } = processedConfig;

      // 构建请求URL
      const fullURL = this.buildURL(url, baseURL);

      // 合并请求头
      const mergedHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      // 创建超时控制器
      const { controller, timeoutId } = this.createTimeoutController(timeout);

      // 构建fetch选项
      const fetchOptions: RequestInit = {
        method,
        headers: mergedHeaders,
        signal: controller.signal,
      };

      // 处理请求体
      if (data && method !== 'GET') {
        if (mergedHeaders['Content-Type']?.includes('application/json')) {
          fetchOptions.body = JSON.stringify(data);
        } else if (data instanceof FormData) {
          fetchOptions.body = data;
          // FormData会自动设置Content-Type，需要删除手动设置的
          delete mergedHeaders['Content-Type'];
        } else {
          fetchOptions.body = data;
        }
      }

      // 发送请求
      let response = await fetch(fullURL, fetchOptions);
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      // 处理响应拦截器
      response = await this.processResponseInterceptors(response);

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // 解析响应数据
      const responseData = await response.json();
      return responseData;

    } catch (error) {
      // 处理错误拦截器
      return await this.processErrorInterceptors(error as Error);
    }
  }

  // GET请求
  get<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  // POST请求
  post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  // PUT请求
  put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  // DELETE请求
  delete<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // PATCH请求
  patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }
}

// 创建默认实例
const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };
