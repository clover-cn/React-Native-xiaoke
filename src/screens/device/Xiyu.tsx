import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  StatusBar,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import apiService from '../../services/api';
import RadioGroup from '../../components/RadioGroup';
import Radio from '../../components/Radio';
import { goBack } from '../../services/navigationService';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeviceinfo, storage } from '../../utils/Common';
import { useRoute } from '@react-navigation/native';
const Xiyu: React.FC = () => {
  const insets = useSafeAreaInsets(); // 获取安全区域边距
  // 接收参数
  const route = useRoute();
  const devInfo = route.params as { device: any };
  const [isState, setIsState] = useState(false); // 设备是否在使用中
  const [deviceInfo, setDeviceInfo] = useState(devInfo.device || {});
  const labelMap: any = { '0': '空闲', '1': '使用中', '2': '离线' };
  useEffect(() => {
    console.log('======>', insets, deviceInfo);
    // queryDeviceInfo();
    queryOrderStatus();
  }, []);

  // 开始4g消费
  const start4GConsumption = () => {
    console.log('检查设备状态');
    let intervalId: any = null;
    let attempts = 0;
    // 检查设备是否在线
    const checkDeviceStatus = async () => {
      try {
        let devState = await getDeviceinfo('864814071027923');
        console.log('设备状态', devState);
        if (devState == 2) {
          clearInterval(intervalId);
          return;
        }
        // 如果状态是 1 或者尝试次数超过 10 次，停止定时器
        if (devState) {
          clearInterval(intervalId);
        } else if (attempts >= 3) {
          console.log('设备不在线，开始蓝牙消费');
          clearInterval(intervalId);
        }
        attempts++;
      } catch (error) {
        clearInterval(intervalId);
      }
    };
    // 每秒调用 checkDeviceStatus
    intervalId = setInterval(checkDeviceStatus, 2000);
  };
  // 查看设备状态
  const queryDeviceInfo = async () => {
    try {
      let devState = await apiService.queryDeviceInfo('864814071027923');
      console.log('设备状态', devState);
    } catch (error: any) {
      // 使用类型断言或者检查错误对象的属性
      const message = error?.msg || error?.message || '请求失败';
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const consumeOrderId = useRef<string>('');
  // 查询订单状态(根据订单状态决定设备是否在运行中)
  const queryOrderStatus = async () => {
    let res = await apiService.queryOrderStatus(deviceInfo.deviceNo);
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
      let currstate = storage.get('xiyuBluetooth', 'boolean');
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
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable onPress={start4GConsumption} style={styles.shadowWrap}>
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
