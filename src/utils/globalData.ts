// 722蓝牙
const ServiceID_722 = '0000FEE9-0000-1000-8000-00805F9B34FB'; //蓝牙模块固定服务ID
const NotifyCharacteristicUUID_722 = 'D44BC439-ABFD-45A2-B575-925416129600'; // 通知特征值UUID
const WriteCharacteristicUUID_722 = 'D44BC439-ABFD-45A2-B575-925416129601'; // 可写特征值uuid
// 9141蓝牙模块
const ServiceID_9141 = '0000FFF0-0000-1000-8000-00805F9B34FB'; //蓝牙模块固定服务ID
const NotifyCharacteristicUUID_9141 = '0000FFF1-0000-1000-8000-00805F9B34FB'; // 通知特征值UUID
const WriteCharacteristicUUID_9141 = '0000FFF2-0000-1000-8000-00805F9B34FB'; // 可写特征值uuid

class GlobalData {
  private _bluetooth_9141: boolean = false;

  get bluetooth_9141(): boolean {
    return this._bluetooth_9141;
  }

  set bluetooth_9141(value: boolean) {
    this._bluetooth_9141 = value;
  }

  get serviceID(): string {
    return this._bluetooth_9141 ? ServiceID_9141 : ServiceID_722;
  }

  get notifyCharacteristicUUID(): string {
    return this._bluetooth_9141
      ? NotifyCharacteristicUUID_9141
      : NotifyCharacteristicUUID_722;
  }

  get writeCharacteristicUUID(): string {
    return this._bluetooth_9141
      ? WriteCharacteristicUUID_9141
      : WriteCharacteristicUUID_722;
  }
}

const globalData = new GlobalData();

export default globalData;
