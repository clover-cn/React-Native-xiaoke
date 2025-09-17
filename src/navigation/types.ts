// 导航类型定义
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList; params?: any } | undefined;
  Scan: { onResult?: (data: string) => void; onCancel?: () => void };
};

export type MainTabParamList = {
  Home: { scanResult?: string } | undefined;
  Charge: undefined;
  Help: undefined;
  My: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};