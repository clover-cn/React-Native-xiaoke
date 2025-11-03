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
  params?: Record<string, any>; // 用于GET请求的查询参数
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

// 附加: HTTP错误类型，携带请求/响应上下文，便于错误拦截器输出详细信息
export interface HttpErrorRequestInfo {
  url: string;
  method: RequestMethod;
  headers?: Record<string, string>;
  body?: string;
}

export interface HttpErrorResponseInfo {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
  bodyText?: string;
}

export class HttpError extends Error {
  request: HttpErrorRequestInfo;
  response?: HttpErrorResponseInfo;

  constructor(message: string, request: HttpErrorRequestInfo, response?: HttpErrorResponseInfo) {
    super(message);
    this.name = 'HttpError';
    this.request = request;
    this.response = response;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

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

  // 构建查询字符串
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // 构建完整URL
  private buildURL(url: string, params?: Record<string, any>, baseURL?: string): string {
    const base = baseURL || this.baseURL;
    let fullUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    
    // 添加查询参数
    if (params && Object.keys(params).length > 0) {
      const queryString = this.buildQueryString(params);
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
    
    return fullUrl;
  }

  // 安全序列化（用于日志/诊断）
  private safeStringify(val: any): string {
    try {
      if (typeof val === 'string') return val;
      if (val instanceof URLSearchParams) return val.toString();
      // RN 环境下 FormData 存在但不可直接枚举
      // 仅标识为 [FormData] 避免崩溃
      // @ts-ignore
      if (typeof FormData !== 'undefined' && val instanceof FormData) return '[FormData]';
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
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
        params, // 新增params参数
        headers = {},
        timeout = this.timeout,
        baseURL,
      } = processedConfig;

      // 构建请求URL
      const fullURL = this.buildURL(url, params, baseURL);

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


      let requestBodyPreview: string | undefined;

      // 处理请求体
      if (data && method !== 'GET') {
        if (mergedHeaders['Content-Type']?.includes('application/json')) {
          fetchOptions.body = JSON.stringify(data);
          requestBodyPreview = this.safeStringify(data);
        } else if (mergedHeaders['Content-Type']?.includes('application/x-www-form-urlencoded')) {
          // 自动处理 application/x-www-form-urlencoded 格式
          if (typeof data === 'string') {
            // 如果已经是字符串，直接使用
            fetchOptions.body = data;
            requestBodyPreview = data;
          } else if (data instanceof URLSearchParams) {
            // 如果是 URLSearchParams 实例，转换为字符串
            const s = data.toString();
            fetchOptions.body = s;
            requestBodyPreview = s;
          } else {
            // 如果是普通对象，自动转换为 URLSearchParams 格式
            const formData = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                formData.append(key, String(value));
              }
            });
            const s = formData.toString();
            fetchOptions.body = s;
            requestBodyPreview = s;
          }
        } else if (
          // @ts-ignore
          typeof FormData !== 'undefined' && data instanceof FormData
        ) {
          fetchOptions.body = data;
          // FormData会自动设置Content-Type，需要删除手动设置的
          delete (mergedHeaders as any)['Content-Type'];
          requestBodyPreview = '[FormData]';
        } else {
          // 其它类型（如纯文本）
          fetchOptions.body = data as any;
          requestBodyPreview = this.safeStringify(data);
        }
      }

      // 发送请求
      let response = await fetch(fullURL, fetchOptions);
      
      // 清除超时定时器
      clearTimeout(timeoutId);

      // 在拦截器处理前，克隆响应并预读文本用于错误时输出
      const responseClone = response.clone();
      let responseText: string | undefined;
      try {
        responseText = await responseClone.text();
      } catch {
        responseText = undefined;
      }

      // 在传入响应拦截器前，附加请求/响应上下文，供业务错误日志使用
      (response as any).__req = {
        url: fullURL,
        method,
        headers: mergedHeaders,
        body: requestBodyPreview,
      };
      (response as any).__respText = responseText;

      // 处理响应拦截器
      response = await this.processResponseInterceptors(response);

      // 检查响应状态
      if (!response.ok) {
        const headersObj = Object.fromEntries(response.headers.entries());
        const respInfo = {
          status: response.status,
          statusText: response.statusText,
          headers: headersObj,
          url: response.url,
          bodyText: responseText,
        };
        const reqInfo = {
          url: fullURL,
          method,
          headers: mergedHeaders,
          body: requestBodyPreview,
        };
        throw new HttpError(`HTTP Error: ${response.status} ${response.statusText}`, reqInfo, respInfo);
      }

      // 解析响应数据
      const responseData = await response.json();
      return responseData;

    } catch (error) {
      const err = error as Error;

      // 直接透传业务错误，避免被包装导致页面无法识别 msg/code
      if ((err as any)?.name === 'BusinessError') {
        // 不走错误拦截器，直接抛给业务页面
        throw err;
      }

      // 已经是 HttpError，直接交给错误拦截器
      if (err instanceof HttpError) {
        return await this.processErrorInterceptors(err);
      }

      // 其它错误统一包装为 HttpError，附带请求上下文，便于定位
      try {
        const wrapped = new HttpError(err.message, {
          url: config.baseURL ? this.buildURL(config.url, config.params, config.baseURL) : this.buildURL(config.url, config.params),
          method: config.method || 'GET',
          headers: { ...this.defaultHeaders, ...(config.headers || {}) },
          body: config.data
            ? (typeof config.data === 'string'
                ? config.data
                // @ts-ignore
                : (typeof FormData !== 'undefined' && config.data instanceof FormData)
                  ? '[FormData]'
                  : this.safeStringify(config.data))
            : undefined,
        });
        wrapped.name = err.name || 'Error';
        return await this.processErrorInterceptors(wrapped);
      } catch {
        return await this.processErrorInterceptors(err);
      }
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
