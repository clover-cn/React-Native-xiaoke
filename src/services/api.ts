import httpClient from '../utils/request';
import { drsClient, backupClient } from '../utils/interceptors';
import {
  ProjectInfo,
  AccountInfo,
  CouponInfo,
  FeatureToggle,
  DeviceList,
  queryDeviceInfo,
  GetDeviceInfo,
} from '../types/apiTypes';
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
    const response = await httpClient.post<LoginResponse>(
      '/auth/login',
      params,
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  }

  /**
   * 获取项目列表
   */
  async getDeviceList(): Promise<DeviceList> {
    const response = await httpClient.get<DeviceList>(
      '/members/user/project/all',
    );
    return response.data;
  }
  /**
   * 切换项目
   * -URL: /members/user/project/switch
   * @param projectId 项目ID
   */
  async switchProject(
    projectId: string,
  ): Promise<{ ok: boolean; msg: string }> {
    const response = await httpClient.get('/members/user/project/switch', {
      params: { projectId },
    });
    return response.data;
  }
  /**
   * 获取项目信息
   * -URL: /members/user/project/info
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    const response = await httpClient.get<ProjectInfo>(
      '/members/user/project/info',
    );
    return response.data;
  }
  /**
   * 获取用户账户信息
   * -URL: /members/user/project/account
   */
  async getAccountInfo(): Promise<AccountInfo> {
    const response = await httpClient.get<AccountInfo>(
      '/members/user/project/account',
    );
    return response.data;
  }
  /**
   * 获取优惠券信息
   * -URL: /members/user/coupon/valid/num
   */
  async getCouponInfo(): Promise<CouponInfo> {
    const response = await httpClient.get<CouponInfo>(
      '/members/user/coupon/valid/num',
    );
    return response.data;
  }
  /**
   * 获取功能开关
   * -URL: /projects/setting/app/func/get
   */
  async getFeatureToggle(): Promise<FeatureToggle> {
    const response = await httpClient.get<FeatureToggle>(
      '/projects/setting/app/func/get',
      {
        params: { appType: '1' },
      },
    );
    return response.data;
  }
  /**
   * 根据设备编号获取项目id
   * -URL: /projects/appDevice/devNoGetProjectId
   */
  async getProjectID(devNo: string): Promise<string> {
    const response = await httpClient.post<string>(
      '/projects/appDevice/devNoGetProjectId',
      { devNo },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  }
  /**
   * 查看设备状态
   * -URL: /projects/appDevice/queryDeviceInfo
   */
  async queryDeviceInfo(deviceNo: string): Promise<queryDeviceInfo> {
    const response = await httpClient.post<queryDeviceInfo>(
      '/projects/appDevice/queryDeviceInfo',
      { deviceNo },
    );
    return response.data;
  }
  /**
   * 查询设备信息
   * -URL: /projects/deviceInfo/getDeviceInfo
   */
  async getDeviceInfo(devNo: string): Promise<GetDeviceInfo> {
    const response = await httpClient.post<GetDeviceInfo>(
      '/projects/deviceInfo/getDeviceInfo',
      { devNo },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  }

  // 示例开始
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

  async getBackupList(): Promise<
    Array<{ id: string; name: string; createdAt: string; size: number }>
  > {
    const response = await backupClient.get('/list');
    return response.data;
  }

  // 文件上传
  async uploadFile(file: FormData): Promise<{ url: string; filename: string }> {
    const response = await httpClient.post<{ url: string; filename: string }>(
      '/upload',
      file,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }
  // 示例结束
}

// 创建API服务实例
const apiService = new ApiService();

export default apiService;

// 导出常用的API方法，方便直接使用
export const {
  login,
  logout,
  getDeviceList,
  getBluetoothStatus,
  createBackup,
  getBackupList,
  uploadFile,
} = apiService;
