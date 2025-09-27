# Loading 组件使用文档

## 概述
本项目实现了一个类似微信小程序中`wx.showLoading()`和`wx.hideLoading()`的全局Loading功能。

## 组件架构
- `Loading.tsx` - 基础Loading组件
- `GlobalLoading.tsx` - 全局Loading管理组件
- `loadingService.ts` - Loading服务，提供全局状态管理

## 使用方法

### 1. 基本用法
```typescript
import { showLoading, hideLoading } from '../services/loadingService';

// 显示Loading
showLoading({
  title: '启动中...',
  mask: true
});

// 隐藏Loading
hideLoading();
```

### 2. 参数说明
```typescript
interface LoadingOptions {
  title?: string;  // Loading文本，默认为"加载中..."
  mask?: boolean;  // 是否显示遮罩，默认为true
}
```

### 3. 实际使用示例

#### 异步操作中使用
```typescript
const handleAsyncOperation = async () => {
  try {
    // 显示Loading
    showLoading({
      title: '正在处理...',
      mask: true
    });
    
    // 执行异步操作
    const result = await apiService.someOperation();
    
    // 隐藏Loading
    hideLoading();
    
    // 处理结果
    console.log('操作成功', result);
  } catch (error) {
    // 出错时也要隐藏Loading
    hideLoading();
    console.error('操作失败', error);
  }
};
```

#### 设备控制中使用
```typescript
// 开始设备操作
const startDevice = () => {
  showLoading({
    title: '启动中...',
    mask: true
  });
  
  // 设备状态检查逻辑...
  checkDeviceStatus()
    .then(() => {
      hideLoading();
      Toast.show('启动成功');
    })
    .catch(() => {
      hideLoading();
      Toast.show('启动失败');
    });
};

// 停止设备操作
const stopDevice = () => {
  showLoading({
    title: '正在关闭...',
    mask: true
  });
  
  // 停止设备逻辑...
};
```

## API 对比

### 微信小程序
```javascript
// 显示Loading
wx.showLoading({
  title: '启动中...',
  mask: true
});

// 隐藏Loading
wx.hideLoading();
```

### 本项目实现
```typescript
// 显示Loading
showLoading({
  title: '启动中...',
  mask: true
});

// 隐藏Loading
hideLoading();
```

## 特性
- ✅ 全局单例，任何地方都可以调用
- ✅ 支持自定义Loading文本
- ✅ 支持遮罩开关
- ✅ 类似微信小程序的API设计
- ✅ TypeScript支持
- ✅ React Native兼容

## 注意事项
1. 每次调用`showLoading()`都会覆盖之前的Loading状态
2. 记得在异步操作完成后调用`hideLoading()`
3. 在catch块中也要调用`hideLoading()`以确保Loading能正确隐藏
4. Loading组件已集成到App根组件中，无需在每个页面单独引入