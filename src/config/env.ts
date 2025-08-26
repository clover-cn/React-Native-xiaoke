// 配置所有环境变量
const ENV_CONFIG = {
  // 基础环境
  dev: {
    BASE_URL: "http://140.210.202.50:18080",
    DRS_URL: "https://test_offbluetooth.cdzytx.com/",
    BACKUP_URL: "http://140.210.202.50:29527/backup/userOpen",
  },
  test: {
    BASE_URL: "http://140.210.218.252:18080",
    DRS_URL: "https://test_offbluetooth.cdzytx.com/getBluetoothStatus",
    BACKUP_URL: "http://test.backup.cdzytx.com/backup/userOpen",
  },
  prod: {
    BASE_URL: "https://data.app.cdzytx.com",
    DRS_URL: "https://offbluetooth.cdzytx.com/getBluetoothStatus",
    BACKUP_URL: "https://backup.cdzytx.com/backup/userOpen",
  },
  demo: {
    BASE_URL: "https://datam.cdzytx.com",
    DRS_URL: "https://test_offbluetooth.cdzytx.com/getBluetoothStatus", // 示例
    BACKUP_URL: "https://backup.cdzytx.com/backup/userOpen", // 示例
  },
};

// dev 开发环境 | test 测试环境 | prod 生产环境 | demo 演示环境
const CURRENT_ENV = "test";

// 导出当前环境的变量
const currentEnv = ENV_CONFIG[CURRENT_ENV];

export default {
  // 默认导出的值（保持兼容原有代码）
  URL: currentEnv.BASE_URL,
  DRS_URL: currentEnv.DRS_URL,
  BACKUP_URL: currentEnv.BACKUP_URL,

  // 额外导出所有环境
  ENV_CONFIG,
  CURRENT_ENV, // 当前环境  
};

// 类型定义
export type Environment = keyof typeof ENV_CONFIG;
export type EnvConfig = typeof ENV_CONFIG[Environment];
