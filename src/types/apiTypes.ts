export type AuthStackParamList = {
  Login: undefined;
};

export interface ProjectInfo {
  phone: string;
  projectId: string;
  projectName: string;
  groupId: string;
  groupName: string;
  cardNo: any;
  projectUserId: string;
  userName: string;
  userGender: string;
  buildingId: any;
  buildingName: any;
  floorId: any;
  floorName: any;
  roomId: any;
  roomName: any;
  fullAddress: any;
  otherCardNo: string;
  departmentMainId: any;
  departmentMain: any;
  departmentSecondId: any;
  departmentSecond: any;
  withdrawWhite: string;
}

export interface AccountInfo {
  curBalanceFee: string;
  freezeFee: string;
  couponNum: string;
}

export interface CouponInfo {
  num: string;
}

export interface FeatureToggle {
  id: string;
  projectId: string;
  appType: string;
  washMachine: string;
  pipeWaterMachine: string;
  waterMachine: string;
  electricDrierMachine: string;
  washingMachine: string;
  shoesWasher: string;
  dryerMachine: string;
  dryerWholeMachine: string;
  washAppointment: string;
  washAppointmentTimeout: any;
  washAppointmentTimes: any;
  bookingQueueOutTime: string;
  consumePass: string;
  consumeWaterShow: string;
  notServiceForbid: string;
  withdrawFunc: string;
  withdrawBeginTime: any;
  withdrawEndTime: any;
  userInfoFunc: string;
  rechargeFunc: string;
  rechargeCloseRemark: any;
  rechargeOpenRemark: any;
  payeeName: any;
  payeePhone: any;
  realTimePay: string;
  consumeSortType: string;
  selfBindCard: string;
  consumptionCodeState: string;
  createId: string;
  createBy: string;
  createTime: string;
}

export interface DeviceList {
  projects: Projects[];
}

export interface Projects {
  projectId: string;
  projectName: string;
  groupId: string;
  groupName: string;
}
