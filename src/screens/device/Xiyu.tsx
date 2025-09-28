import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  StatusBar,
  Image,
  Pressable,
  Platform,
  Modal,
  AppState,
} from 'react-native';
import apiService from '../../services/api';
import RadioGroup from '../../components/RadioGroup';
import Radio from '../../components/Radio';
import { goBack } from '../../services/navigationService';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getDeviceinfo,
  storage,
  InitialBluetooth,
  destroy,
} from '../../utils/Common';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { showLoading, hideLoading } from '../../services/loadingService';
import BluetoothService from '../../services/bluetoothService';
const Xiyu: React.FC = () => {
  const insets = useSafeAreaInsets(); // 获取安全区域边距
  // 接收参数
  const route = useRoute();
  const devInfo = route.params as { device: any };
  const [isState, setIsState] = useState(false); // 设备是否在使用中
  const [deviceInfo, setDeviceInfo] = useState(devInfo.device || {});
  const labelMap: any = { '0': '空闲', '1': '使用中', '2': '离线' };

  useEffect(() => {
    console.log('获取安全区', insets);
    console.log('传入的设备信息：', deviceInfo);
    queryOrderStatus();

    // 监听应用状态变化
    let backgroundTimer: any = null;

    const handleAppStateChange = (nextAppState: string) => {
      console.log('应用状态变化:', nextAppState);
      // 'active' - 应用在前台运行
      // 'background' - 整个应用被切换到手机后台（比如按Home键、切换到其他应用）
      // 'inactive' - 应用处于过渡状态（比如来电话时）

      if (nextAppState === 'background') {
        // 应用进入后台，延迟销毁蓝牙
        backgroundTimer = setTimeout(() => {
          if (AppState.currentState === 'background') {
            console.log('应用长时间在后台，销毁蓝牙');
            destroy();
          }
        }, 30000); // 30秒后如果仍在后台则销毁
      } else if (nextAppState === 'active') {
        // 应用重新激活，清除销毁定时器
        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
          backgroundTimer = null;
          console.log('应用重新激活，取消蓝牙销毁定时器');
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // 设备启动或者关闭
  const toggleDevice = () => {
    if (isState) {
      end4gConsumption();
    } else {
      start4GConsumption();
    }
  };

  // 开始4g消费
  const start4GConsumption = async () => {
    console.log('检查设备状态');

    try {
      await InitialBluetooth(deviceInfo.mac);
      console.log('蓝牙初始化成功');
    } catch (error: any) {
      console.error('蓝牙初始化失败:', error);
      ToastAndroid.show(error.message, ToastAndroid.LONG);
      return;
    }

    return;
    showLoading({
      title: '启动中...',
      mask: true,
    });

    let intervalId: any = null;
    let attempts = 0;
    // 检查设备是否在线
    const checkDeviceStatus = async () => {
      try {
        let devState = await getDeviceinfo(deviceInfo.deviceNo);
        console.log('设备状态', devState);
        if (devState == 2) {
          clearInterval(intervalId);
          hideLoading(); // 隐藏Loading
          return;
        }
        // 如果状态是 1 或者尝试次数超过 10 次，停止定时器
        if (devState) {
          console.log('设备在线，开始4G消费');
          clearInterval(intervalId);
          postConsumeStart();
        } else if (attempts >= 3) {
          console.log('设备不在线，开始蓝牙消费');
          clearInterval(intervalId);
          hideLoading(); // 隐藏Loading
        }
        attempts++;
      } catch (error) {
        clearInterval(intervalId);
        hideLoading(); // 出错时隐藏Loading
      }
    };
    // 每秒调用 checkDeviceStatus
    intervalId = setInterval(checkDeviceStatus, 2000);
  };

  // 查看设备状态
  const queryDeviceInfo = async () => {
    try {
      let devState = await apiService.queryDeviceInfo(deviceInfo.deviceNo);
      console.log('设备状态', devState);
      setDeviceInfo(devState);
    } catch (error: any) {
      // 使用类型断言或者检查错误对象的属性
      const message = error?.msg || error?.message || '请求失败';
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const consumeOrderId = useRef<string>('');

  // 查询设备是否在运行中
  const queryOrderStatus = async () => {
    let res = await apiService.getDeviceStatus(deviceInfo.deviceNo);
    console.log('订单状态', res);
    if (res) {
      consumeOrderId.current = res.id;
    }
    if (!res) {
      setIsState(false);
      return;
    }
    if (res && res.state === '1') {
      setIsState(true);
      return;
    }
    if (res && parseInt(res.state) > 1) {
      setIsState(false);
      // 判断蓝牙状态
      // if (that.data.xiyuBluetooth || currstate) {
      //   console.log('使用蓝牙停止');
      //   // 使用蓝牙停止
      //   that.setData({
      //     isState: false,
      //     xiyuBluetooth: false,
      //   });
      //   return;
      // }
    }
  };

  const Deviceinfo = useRef<object>({});
  // 创建订单
  const postConsumeStart = async () => {
    try {
      let reqData = {
        consumeEncodeData: '', // 设备给APP的加密数据, 仅当netType为蓝牙时候需要传递
        devNo: deviceInfo.deviceNo, // 	设备编号
        gear: '', // 档位 - 有档位设备才传递,
        liquid: '', // 加液标识 - tcl相关才有, '01':只加洗衣液/'02':加洗衣液和消毒液
        netType: '', // 设备网络类型, 0:4G/1:蓝牙 不传默认4g
        rateSettingId: '', // 费率设置id - 有就回传回来
        consumeFrom: '1', // app消费的来源-0:(默认)扫屏幕码进入消费,1:从打印的静态码进入消费, 2:常用设备进入消费进入消费
      };
      let res = await apiService.postConsumeStart(reqData);
      deviceStatus(res.consumeOrderId)
        .then(devState => {
          const devStateStr = devState as string;
          if (parseInt(devStateStr) >= 1 && devStateStr !== '4') {
            console.log('设备正常启动');
            setIsState(true);
            Deviceinfo.current = res;
            queryDeviceInfo();
            storage.set('xiyuOrder', res.consumeOrderId);
            consumeOrderId.current = res.consumeOrderId;
            hideLoading(); // 启动成功后隐藏Loading
            ToastAndroid.show('启动成功', ToastAndroid.SHORT);
            // that.setData({
            //   Deviceinfo: res.data.data,
            //   isState: true,
            //   xiyuBluetooth: false,
            // });
            // that.setStorage();
            // wx.setStorageSync('xiyuBluetooth', false);
            // wx.setStorageSync(that.data.param.deviceNo, {
            //   isOffline: false,
            //   deviceNo: that.data.param.deviceNo,
            // });
            // wx.setStorageSync('xiyuOrder', res.data.data.consumeOrderId);
            // wx.showToast({
            //   title: '启动成功',
            //   icon: 'success',
          } else if (devStateStr === '4') {
            hideLoading(); // 订单取消时隐藏Loading
            ToastAndroid.show('订单已取消，请重试。', ToastAndroid.SHORT);
          } else {
            hideLoading(); // 设备响应超时时隐藏Loading
            console.log('设备响应超时，开始启动蓝牙');
            // common
            //   .InitialBluetooth(
            //     that.data.DeviceId,
            //     that.data.param.deviceNo,
            //     res.data.data.consumeOrderId,
            //   )
            //   .then(hexString => {
            //     that.twoVaryBluetooth(res.data.data.consumeOrderId, hexString);
            //   })
            //   .catch(err => {
            //     common.CutoffBluetooth();
            //   });
          }
        })
        .catch(err => {
          hideLoading(); // 启动失败时隐藏Loading
          console.log('设备启动失败', err);
          ToastAndroid.show('设备启动失败', ToastAndroid.SHORT);
        });
    } catch (error: any) {
      hideLoading(); // 异常时隐藏Loading
      ToastAndroid.show(error.msg, ToastAndroid.SHORT);
    }
  };

  // 查询订单状态
  const deviceStatus = (consumeOrderId: string) => {
    return new Promise((resolve, reject) => {
      let intervalId: any = null;
      let attempts = 0;
      const checkDeviceStatus = async () => {
        try {
          let { state: devState } = await apiService.postOrderDetail(
            consumeOrderId,
          );
          console.log('轮询设备订单状态', devState);
          if (devState === '0' && attempts >= 7) {
            clearInterval(intervalId);
            resolve(devState);
          } else if (devState === '1' && (!isState || attempts >= 7)) {
            clearInterval(intervalId);
            resolve(devState);
          } else if (parseInt(devState) > 1) {
            clearInterval(intervalId);
            resolve(devState);
          }
          attempts++;
        } catch (error) {
          clearInterval(intervalId);
          reject();
        }
      };
      intervalId = setInterval(checkDeviceStatus, 2000);
    });
  };

  // 结束4G消费
  const end4gConsumption = () => {
    showLoading({
      title: '正在关闭...',
      mask: true,
    });

    let xiyuOrder = storage.get('xiyuOrder') as string;
    let intervalId: any = null;
    let attempts = 0;
    // 检查设备是否在线
    const checkDeviceStatus = async () => {
      try {
        let devState = await getDeviceinfo(deviceInfo.deviceNo);
        console.log('设备状态', devState);
        if (devState == 2) {
          clearInterval(intervalId);
          hideLoading(); // 设备离线时隐藏Loading
          return;
        }
        // 如果状态是 1 或者尝试次数超过 10 次，停止定时器
        if (devState) {
          console.log('设备在线，开始4G停止');
          clearInterval(intervalId);
          endAppConsumer(xiyuOrder);
        } else if (attempts >= 3) {
          console.log('设备不在线，开始蓝牙停止');
          clearInterval(intervalId);
          hideLoading(); // 设备不在线时隐藏Loading
        }
        attempts++;
      } catch (error) {
        clearInterval(intervalId);
        hideLoading(); // 出错时隐藏Loading
      }
    };
    intervalId = setInterval(checkDeviceStatus, 2000);
  };

  // 结束订单
  const endAppConsumer = async (xiyuOrder: string) => {
    try {
      let reqData = {
        devGroupId: deviceInfo.deviceGroupId,
        devNo: deviceInfo.deviceNo,
        orderNumbers: consumeOrderId.current || xiyuOrder,
      };
      let res = await apiService.endAppConsumer(reqData);
      console.log('结束订单', res);

      deviceStatus(consumeOrderId.current || xiyuOrder)
        .then(devState => {
          const devStateStr = devState as string;
          if (devStateStr === '1') {
            console.log('关闭设备响应超时，启动蓝牙关闭');
          } else {
            // 判断是否开启及时支付
            if (res.isImmediately) {
              console.log('启动及时支付');
            }
            setIsState(false);
            queryDeviceInfo();
            hideLoading(); // 关闭成功后隐藏Loading
            ToastAndroid.show('关闭成功', ToastAndroid.SHORT);
          }
        })
        .catch(err => {
          hideLoading(); // 关闭失败时隐藏Loading
          console.log('设备启动失败', err);
          ToastAndroid.show('设备启动失败', ToastAndroid.SHORT);
        });
    } catch (error: any) {
      hideLoading(); // 异常时隐藏Loading
      ToastAndroid.show(error.msg, ToastAndroid.SHORT);
    }
  };

  // 监听页面焦点状态(页面聚焦/失焦)
  useFocusEffect(
    useCallback(() => {
      console.log('获得焦点');
      return () => {
        console.log('失去焦点');
        destroy(); // 主动销毁蓝牙
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <Image
        style={{ width: '100%', height: 250 }}
        source={require('../../../assets/images/img_hgj2.png')}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.contentList}>
          <View style={styles.listLeft}>
            <Image
              style={styles.contentIcon}
              source={require('../../../assets/images/icon_dqsj.png')}
              resizeMode="contain"
            />
            <Text>服务时段</Text>
          </View>
          <Text>00:00~23:59</Text>
        </View>
        <View style={styles.Line}></View>
        <View style={styles.contentList}>
          <View style={styles.listLeft}>
            <Image
              style={styles.contentIcon}
              source={require('../../../assets/images/icon_sbzt.png')}
              resizeMode="contain"
            />
            <Text>设备状态</Text>
          </View>
          {/* <Text>{deviceInfo.deviceStatus === '0' ? '空闲' : '使用中'}</Text> */}
          <Text>{labelMap[deviceInfo?.deviceStatus] ?? '未知'}</Text>
        </View>
        <View style={styles.Line}></View>
        <View style={styles.contentList}>
          <View style={styles.listLeft}>
            <Image
              style={styles.contentIcon}
              source={require('../../../assets/images/icon_sbbh.png')}
              resizeMode="contain"
            />
            <Text>设备编号</Text>
          </View>
          <Text>123456789</Text>
        </View>
        <View style={styles.Line}></View>
        <View style={styles.contentList}>
          <View style={styles.listLeft}>
            <Image
              style={styles.contentIcon}
              source={require('../../../assets/images/icon_sbwz.png')}
              resizeMode="contain"
            />
            <Text>设备地址</Text>
          </View>
          <Text>123456789</Text>
        </View>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable onPress={toggleDevice} style={styles.shadowWrap}>
            <LinearGradient
              colors={isState ? ['#FD3563', '#FE3547'] : ['#FF510A', '#FE8F0A']} // 对应的起始和结束颜色
              locations={[0.03, 1.0]} // 对应 3% 和 100%
              start={{ x: 0, y: 0.5 }} // 渐变开始点：左上角
              end={{ x: 1, y: 0.5 }} // 渐变结束点：左下角 (从上到下)
              style={styles.consumeStart}
            >
              <Text style={styles.consumeText}>
                {isState ? '结束消费' : '开始消费'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    boxSizing: 'border-box',
    padding: 20,
    paddingBottom: 90, // 为 footer 留出空间
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    marginTop: -40,
  },

  contentIcon: {
    width: 40,
    marginRight: 10,
  },

  contentList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  Line: {
    height: 1,
    backgroundColor: '#E8E8E9',
  },

  consumeStart: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },

  shadowWrap: {
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 8, 68, 0.302)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1, // 已在颜色里含 alpha，设为 1 即可
        shadowRadius: 32, // 对应 CSS blur 32px
      },
      android: {
        elevation: 5, // 近似效果；颜色不可控
        // RN 新版对 shadowColor 支持有限，通常仍以 elevation 为准
        shadowColor: '#FF0844',
      },
    }),
  },
  consumeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Xiyu;
