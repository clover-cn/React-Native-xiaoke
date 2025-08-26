# HTTP请求拦截器使用指南

基于 Fetch API 封装的完整HTTP请求解决方案，支持请求/响应拦截、多环境配置、错误处理等功能。

## 📁 文件结构

```
src/
├── config/
│   └── env.ts              # 环境配置
├── utils/
│   ├── request.ts          # 核心HTTP客户端
│   ├── interceptors.ts     # 拦截器配置
│   └── http.ts            # 初始化和工具导出
├── services/
│   └── api.ts             # API服务层
└── examples/
    └── HttpExample.tsx    # 使用示例
```

## 🚀 快速开始

### 1. 初始化HTTP客户端

在你的App.tsx或入口文件中初始化：

```typescript
import React from 'react';
import { initHttp } from './src/utils/http';
import { AppNavigator } from './src';

// 初始化HTTP客户端
initHttp();

const App: React.FC = () => {
  return <AppNavigator />;
};

export default App;
```

### 2. 基本使用

```typescript
import { apiService, httpClient } from './src/utils/http';

// 使用预定义的API服务
const userInfo = await apiService.getUserInfo();

// 或直接使用HTTP客户端
const response = await httpClient.get('/api/users');
```

## 🔧 配置说明

### 环境配置 (src/config/env.ts)

支持四种环境：`dev`、`test`、`prod`、`demo`

```typescript
// 切换环境只需修改这一行
const CURRENT_ENV = "test";
```

### 自定义配置

```typescript
import { configureHttp } from './src/utils/http';

configureHttp({
  baseURL: 'https://api.example.com',
  timeout: 15000,
  token: 'your-auth-token',
  headers: {
    'Custom-Header': 'value',
  },
});
```

## 🔌 拦截器功能

### 请求拦截器

自动添加以下功能：
- **认证Token**: 自动添加 `Authorization: Bearer <token>` 头
- **公共参数**: 添加时间戳、客户端信息等
- **请求日志**: 打印请求详情

### 响应拦截器

自动处理：
- **响应日志**: 打印响应详情
- **业务错误**: 根据错误码显示相应提示
- **认证失效**: 自动清除token并提示重新登录

### 错误拦截器

处理网络错误：
- **超时错误**: 显示"请求超时"提示
- **网络错误**: 显示"网络连接失败"提示
- **HTTP错误**: 根据状态码显示相应错误信息

## 📡 API服务使用

### 用户认证

```typescript
import { apiService, setToken } from './src/utils/http';

// 登录
const loginResponse = await apiService.login({
  username: 'user@example.com',
  password: 'password123',
});

// 保存token
setToken(loginResponse.token);

// 获取用户信息
const userInfo = await apiService.getUserInfo();
```

### 设备管理

```typescript
// 获取设备列表
const devices = await apiService.getDeviceList();

// 扫描设备
const scanResult = await apiService.scanDevice('QR_CODE_STRING');

// 获取单个设备信息
const device = await apiService.getDeviceById('device_id');
```

### 充电服务

```typescript
// 开始充电
const session = await apiService.startCharge({
  deviceId: 'device_001',
  qrCode: 'CHARGE_QR_CODE',
});

// 停止充电
const completedSession = await apiService.stopCharge(session.id);

// 获取充电历史
const history = await apiService.getChargeHistory(1, 20);
```

### 多服务支持

```typescript
// 使用DRS服务检查蓝牙状态
const bluetoothStatus = await apiService.getBluetoothStatus();

// 使用备份服务
const backup = await apiService.createBackup(data);
```

## 🛠️ 高级功能

### 文件上传

```typescript
const formData = new FormData();
formData.append('file', fileData);

const uploadResult = await apiService.uploadFile(formData);
```

### 请求管理

```typescript
import { requestManager } from './src/utils/http';

// 取消特定请求
requestManager.cancelRequest('request_key');

// 取消所有请求
requestManager.cancelAllRequests();

// 获取待处理请求数量
const pendingCount = requestManager.getPendingRequestsCount();
```

### 环境切换（开发时）

```typescript
import { switchEnvironment } from './src/utils/http';

// 切换到测试环境
switchEnvironment('test');

// 切换到生产环境
switchEnvironment('prod');
```

## 🎯 最佳实践

### 1. 错误处理

```typescript
try {
  const data = await apiService.getUserInfo();
  // 处理成功响应
} catch (error) {
  // 错误已在拦截器中处理，这里可以做额外处理
  console.error('Additional error handling:', error);
}
```

### 2. Loading状态管理

```typescript
const [loading, setLoading] = useState(false);

const handleRequest = async () => {
  setLoading(true);
  try {
    await apiService.someRequest();
  } finally {
    setLoading(false);
  }
};
```

### 3. Token管理

```typescript
import { setToken, getToken, clearToken } from './src/utils/http';

// 登录成功后保存token
setToken(response.token);

// 检查是否已登录
const isLoggedIn = !!getToken();

// 退出登录时清除token
clearToken();
```

## 🔍 调试

开发环境下，所有请求和响应都会在控制台打印详细日志：

```
🚀 Request: { url: '/api/users', method: 'GET', ... }
📥 Response: { status: 200, ... }
📄 Response Data: { code: 200, data: [...] }
```

## 📱 React Native集成

这个HTTP客户端专为React Native设计，包含：

- **网络状态检测**: 自动处理网络连接问题
- **原生错误提示**: 使用Alert显示错误信息
- **异步存储**: 支持AsyncStorage（需要额外配置）
- **跨平台兼容**: 支持iOS和Android

## 🔧 自定义拦截器

如果需要添加自定义拦截器：

```typescript
import { httpClient } from './src/utils/http';

// 添加自定义请求拦截器
httpClient.addRequestInterceptor((config) => {
  // 自定义逻辑
  return config;
});

// 添加自定义响应拦截器
httpClient.addResponseInterceptor((response) => {
  // 自定义逻辑
  return response;
});
```

## 📋 类型支持

完整的TypeScript类型支持：

```typescript
import type {
  RequestConfig,
  ResponseData,
  User,
  Device,
  ChargeSession,
} from './src/utils/http';
```

## 🚨 注意事项

1. **Token存储**: 示例中使用内存存储，生产环境建议使用AsyncStorage
2. **错误处理**: 拦截器已处理大部分错误，组件中可专注业务逻辑
3. **环境切换**: 生产环境请确保使用正确的环境配置
4. **网络权限**: 确保应用有网络访问权限

## 📚 相关文档

- [Fetch API文档](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Native网络请求](https://reactnative.dev/docs/network)
- [TypeScript类型定义](https://www.typescriptlang.org/docs/)
