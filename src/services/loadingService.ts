interface LoadingOptions {
  title?: string;
  mask?: boolean;
}

interface LoadingState {
  visible: boolean;
  title: string;
  mask: boolean;
}

type LoadingCallback = (state: LoadingState) => void;

class LoadingService {
  private isLoading: boolean = false;
  private currentOptions: LoadingOptions = {
    title: '加载中...',
    mask: true,
  };
  private callbacks: LoadingCallback[] = [];

  // 显示Loading
  showLoading(options: LoadingOptions = {}) {
    this.isLoading = true;
    this.currentOptions = {
      title: options.title || '加载中...',
      mask: options.mask !== undefined ? options.mask : true,
    };
    
    // 通知所有监听器
    this.notifyCallbacks();
  }

  // 隐藏Loading
  hideLoading() {
    this.isLoading = false;
    
    // 通知所有监听器
    this.notifyCallbacks();
  }

  // 获取当前Loading状态
  getLoadingState(): LoadingState {
    return {
      visible: this.isLoading,
      title: this.currentOptions.title || '加载中...',
      mask: this.currentOptions.mask !== undefined ? this.currentOptions.mask : true,
    };
  }

  // 监听Loading状态变更
  onLoadingChange(callback: LoadingCallback) {
    this.callbacks.push(callback);
    
    // 返回取消监听的函数
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // 通知所有回调函数
  private notifyCallbacks() {
    const state = this.getLoadingState();
    this.callbacks.forEach(callback => callback(state));
  }
}

// 创建全局单例
const loadingService = new LoadingService();

export default loadingService;

// 导出便捷方法，类似微信小程序的API
export const showLoading = (options: LoadingOptions = {}) => {
  loadingService.showLoading(options);
};

export const hideLoading = () => {
  loadingService.hideLoading();
};