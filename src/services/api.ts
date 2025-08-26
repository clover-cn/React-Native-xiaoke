import httpClient from '../utils/request';
import { drsClient, backupClient } from '../utils/interceptors';

// 用户相关接口
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// 设备相关接口
export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'charging';
  location?: string;
  batteryLevel?: number;
}

export interface ScanResult {
  deviceId: string;
  qrCode: string;
  timestamp: number;
}

// 充电相关接口
export interface ChargeSession {
  id: string;
  deviceId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  cost?: number;
  status: 'charging' | 'completed' | 'failed';
}

export interface StartChargeParams {
  deviceId: string;
  qrCode: string;
}

// API服务类(示例)
class ApiService {
  // 用户认证相关
  async login(params: LoginParams): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', params);
    return response.data;
  }

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  }

  async getUserInfo(): Promise<User> {
    const response = await httpClient.get<User>('/user/info');
    return response.data;
  }

  async updateUserInfo(userInfo: Partial<User>): Promise<User> {
    const response = await httpClient.put<User>('/user/info', userInfo);
    return response.data;
  }

  // 设备相关
  async getDeviceList(): Promise<Device[]> {
    const response = await httpClient.get<Device[]>('/devices');
    return response.data;
  }

  async getDeviceById(deviceId: string): Promise<Device> {
    const response = await httpClient.get<Device>(`/devices/${deviceId}`);
    return response.data;
  }

  async scanDevice(qrCode: string): Promise<ScanResult> {
    const response = await httpClient.post<ScanResult>('/devices/scan', { qrCode });
    return response.data;
  }

  // 充电相关
  async startCharge(params: StartChargeParams): Promise<ChargeSession> {
    const response = await httpClient.post<ChargeSession>('/charge/start', params);
    return response.data;
  }

  async stopCharge(sessionId: string): Promise<ChargeSession> {
    const response = await httpClient.post<ChargeSession>(`/charge/stop/${sessionId}`);
    return response.data;
  }

  async getChargeHistory(page: number = 1, limit: number = 20): Promise<{
    list: ChargeSession[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await httpClient.get(`/charge/history?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getChargeSession(sessionId: string): Promise<ChargeSession> {
    const response = await httpClient.get<ChargeSession>(`/charge/session/${sessionId}`);
    return response.data;
  }

  // 使用DRS服务检查蓝牙状态
  async getBluetoothStatus(): Promise<{ status: boolean; message: string }> {
    const response = await drsClient.get('/getBluetoothStatus');
    return response.data;
  }

  // 使用备份服务
  async createBackup(data: any): Promise<{ backupId: string; url: string }> {
    const response = await backupClient.post('/userOpen', data);
    return response.data;
  }

  async getBackupList(): Promise<Array<{ id: string; name: string; createdAt: string; size: number }>> {
    const response = await backupClient.get('/list');
    return response.data;
  }

  // 文件上传
  async uploadFile(file: FormData): Promise<{ url: string; filename: string }> {
    const response = await httpClient.post<{ url: string; filename: string }>('/upload', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 获取统计数据
  async getStatistics(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    totalSessions: number;
    totalRevenue: number;
  }> {
    const response = await httpClient.get('/statistics');
    return response.data;
  }

  // 获取公告列表
  async getNotifications(): Promise<Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'error';
    createdAt: string;
    read: boolean;
  }>> {
    const response = await httpClient.get('/notifications');
    return response.data;
  }

  // 标记公告为已读
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await httpClient.put(`/notifications/${notificationId}/read`);
  }
}

// 创建API服务实例
const apiService = new ApiService();

export default apiService;

// 导出常用的API方法，方便直接使用
export const {
  login,
  logout,
  getUserInfo,
  updateUserInfo,
  getDeviceList,
  getDeviceById,
  scanDevice,
  startCharge,
  stopCharge,
  getChargeHistory,
  getChargeSession,
  getBluetoothStatus,
  createBackup,
  getBackupList,
  uploadFile,
  getStatistics,
  getNotifications,
  markNotificationAsRead,
} = apiService;
