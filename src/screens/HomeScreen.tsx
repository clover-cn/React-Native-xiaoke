import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../hooks/useTheme';
import BannerCarousel from '../components/BannerCarousel';
import HomeHeader from '../components/HomeHeader';
import { Images } from '../assets/images';
import LinearGradient from 'react-native-linear-gradient'; // 导入 LinearGradient
import { useScan } from '../contexts/ScanContext';
import { useMainScreenBackHandler } from '../navigation/AppNavigator';
import { navigate } from '../services/navigationService';
import apiService, { User, Device, LoginParams } from '../services/api';
import { computeNumber } from '../utils/Common';
import { AccountInfo } from '../types/apiTypes';
const { width } = Dimensions.get('window');
const COMMON_IMG_ASPECT_RATIO = 106 / 670; // 图片实际宽高比
const calculatedImageHeight = (width - 40) * COMMON_IMG_ASPECT_RATIO;
interface HomeScreenProps {
  scanResult?: string;
  onScanResultReceived?: () => void;
}

const SCROLL_SWITCH_OFFSET = 80; // 超过该偏移后，切换为深色文字/白底

const HomeScreen: React.FC<HomeScreenProps> = ({
  scanResult,
  onScanResultReceived,
}) => {
  const { theme } = useTheme();
  const { startScan } = useScan();
  const insets = useSafeAreaInsets(); // 获取安全区域边距

  // 页面焦点状态
  const [isFocused, setIsFocused] = useState(false);

  // 监听页面焦点状态(页面聚焦/失焦)
  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen 获得焦点');
      projectList();
      setIsFocused(true);
      return () => {
        console.log('HomeScreen 失去焦点');
        setIsFocused(false);
      };
    }, []),
  );

  // 使用React Navigation的返回键处理
  useMainScreenBackHandler();

  // 底部 TabBar 遮挡处理：TabBar 组件整体高度 = tabbarNav(70) + secure(32) - tabbarBox.bottom(-30)
  // 实际覆盖可见高度大约为 70 + 32 - 30 = 72，再加上底部安全区
  const TABBAR_VISIBLE_HEIGHT = 72 + insets.bottom;
  const deviceTypesData = [
    {
      id: '1',
      name: '洗浴',
      image: require('../../assets/images/icon_home_xiyu.png'),
    },
    {
      id: '2',
      name: '饮水机',
      image: require('../../assets/images/icon_home_ysj1.png'),
    },
    {
      id: '3',
      name: '电吹风',
      image: require('../../assets/images/icon_home_dcf.png'),
    },
    {
      id: '4',
      name: '洗衣烘干',
      image: require('../../assets/images/icon_home_xygy.png'),
    },
    {
      id: '5',
      name: '洗鞋机',
      image: require('../../assets/images/icon_home_xxj.png'),
    },
  ];
  const commonDevice = [
    {
      id: '1',
      name: '洗浴',
      address: '1栋 1层 1-1房间',
    },
    {
      id: '2',
      name: '电吹风',
      address: '1栋 1层 1-1房间',
    },
    {
      id: '3',
      name: '洗衣机',
      address: '1栋 1层 1-1房间',
    },
    {
      id: '4',
      name: '洗衣机',
      address: '1栋 1层 1-1房间',
    },
  ];

  // 模拟消息数据
  const messages = [
    { id: '1', title: '您有新消息!' },
    { id: '2', title: '系统维护通知' },
    { id: '3', title: '充值优惠活动开始了' },
    { id: '4', title: '设备维修完成' },
    { id: '5', title: '新功能上线啦' },
  ];

  // 自动轮播相关
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播效果
  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex === messages.length - 1 ? 0 : prevIndex + 1;

        // 滚动到下一条消息
        scrollViewRef.current?.scrollTo({
          y: nextIndex * 32, // 32是每条消息的高度
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // 每3秒切换一次

    return () => clearInterval(timer);
  }, [messages.length]);

  // 顶部状态栏样式：在顶部使用“透明 + 浅色字”，下滑后使用“白底 + 深色字”
  // 为避免切 translucent 导致的重布局卡顿，translucent 固定 true，仅通过覆盖层透明度 + barStyle 切换
  const [isScrolled, setIsScrolled] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const onScroll = (e: any) => {
    const y = e?.nativeEvent?.contentOffset?.y || 0;
    // 渐变计算（0~SCROLL_SWITCH_OFFSET 线性映射到 0~1）
    const ratio = Math.min(1, Math.max(0, y / SCROLL_SWITCH_OFFSET));
    setOverlayOpacity(ratio);
    setIsScrolled(ratio >= 1);
  };

  const handleTitlePress = () => {
    console.log('项目选择被点击');
    // 转跳projectList页面
    navigate('ProjectList');
  };

  const handleMessagePress = (message: any) => {
    console.log('消息被点击:', message);
    // 这里可以打开消息详情
  };

  // 启动扫码的函数
  const startScanFromHome = () => {
    console.log('从首页启动扫码');
    startScan(
      (data: string) => {
        console.log('首页内部扫码结果:', data);
        handleScanResult(data);
      },
      () => {
        console.log('扫码取消');
      },
    );
  };

  // 处理从外部传入的扫码结果
  useEffect(() => {
    if (scanResult) {
      console.log('首页接收到外部扫码结果:', scanResult);
      // 处理扫码结果，但不再次启动扫码
      handleScanResult(scanResult);
      if (onScanResultReceived) {
        onScanResultReceived();
      }
    }
  }, [scanResult]);

  // 处理扫码结果的函数
  const handleScanResult = (data: string) => {
    const result = data.trim();
    console.log('扫码信息:', result);
    if (result.startsWith('XYJ')) {
      console.log('洗衣机码');
      // 服务是否脱机
      // if (app.globalData.isOffline) {
      //   that.queryOnServiceDown(result)
      //   return
      // }
      Scaninfo(result);
      return;
    }
    const isPureNumber = /^[0-9]{15}$/.test(result);
    if (isPureNumber) {
      console.log('设备码');
      // if (app.globalData.isOffline) {
      //   that.queryOnServiceDown(result)
      //   return
      // }
      Scaninfo(result);
      return;
    }
    const tlis = result.split('=');
    const imei = tlis[1].trim() || tlis[0].trim(); // 默认取 tlis[0]，如果 tlis[1] 未定义
    if (!imei) {
      console.log('请扫描正确二维码');

      return;
    }
    if (imei.startsWith('xmm')) {
      console.log('项目码');
      if (imei.includes('&card')) {
        // 卡注册方式 3卡注册 4合码注册
        let card = imei.split('&')[1];
        // app.globalData.mpInputParam.card = card.split('card')[1]
      }
      projectCode(imei);
    } else if (imei.split('-')[1]) {
      console.log(
        '设备码带有标识',
        '设备码:' + imei.split('-')[1],
        '标识：' + imei.split('-')[0],
      );
      // app消费的来源-0:(默认)扫屏幕码进入消费,1:从打印的静态码进入消费, 2:常用设备进入消费进入消费
      // app.globalData.imeiType = imei.split("-")[0] ? imei.split("-")[0] : '1'
      // if (app.globalData.isOffline) {
      //   that.queryOnServiceDown(imei.split("-")[1])
      //   return
      // }
      Scaninfo(imei.split('-')[1]);
    } else {
      console.log('设备码:', imei);
      // if (app.globalData.isOffline) {
      //   that.queryOnServiceDown(imei)
      //   return
      // }
      Scaninfo(imei);
    }
  };

  const [projectName, setProjectName] = useState<string>('暂无项目'); // 当前项目名称
  // 获取项目列表
  const projectList = async () => {
    try {
      const res: any = await apiService.getDeviceList();
      console.log('获取项目列表', res);
      if (res.projects.length > 0) {
        console.log('开始设置当前项目为第一个:', res.projects[0]);
        setProjectName(res.projects[0].projectName);
        switchProject(res.projects[0].projectId);
      } else if (res.projects.length <= 0) {
        console.warn('项目为空');
      }
    } catch (e) {
      console.error(e);
    }
  };
  const [AccountInfo, setAccountInfo] = useState({
    curBalanceFee: '0.00',
    num: '0',
  }); // 账户信息
  // 切换项目
  const switchProject = async (projectId: string) => {
    try {
      const res = await apiService.switchProject(projectId);
      if (!res.ok) return;

      console.log('切换项目成功');

      void apiService
        .getProjectInfo()
        .then(p => console.log('获取项目信息', p))
        .catch(() => {});

      void apiService
        .getAccountInfo()
        .then(u => {
          console.log('用户账户信息', u);
          setAccountInfo(prev => ({
            ...prev,
            curBalanceFee: computeNumber(u.curBalanceFee, '/', 1000)
              .result as string,
          }));
        })
        .catch(() => {});

      void apiService
        .getCouponInfo()
        .then(c => {
          setAccountInfo(prev => ({
            ...prev,
            num: c.num,
          }));
        })
        .catch(() => {});

      void apiService
        .getFeatureToggle()
        .then(f => console.log('获取功能开关', f))
        .catch(() => {});
    } catch {
      ToastAndroid.show('切换项目失败', ToastAndroid.SHORT);
    }
  };

  // 扫码信息查询
  const Scaninfo = async (result: string) => {
    try {
      // 根据设备编号获取项目id
      await getDevCode(result);
      let res2 = await apiService.queryDeviceInfo(result);
      console.log('扫码信息查询', res2);
    } catch (error) {
      ToastAndroid.show('获取项目ID失败', ToastAndroid.SHORT);
    }
  };

  // 项目码处理函数
  const projectCode = async (code: string) => {};

  // 根据设备编号获取项目id
  const getDevCode = async (deviceCode: string) => {
    try {
      let res = await apiService.getProjectID(deviceCode);
      console.log('根据设备编号获取项目id', res);
    } catch (error) {
      ToastAndroid.show('获取项目ID失败', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 页面内容 */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: TABBAR_VISIBLE_HEIGHT }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        {/* 自定义Header */}
        <HomeHeader
          projectName={projectName}
          onTitlePress={handleTitlePress}
          statusBarTranslucent={true}
          statusBarBgColor="#FF752A"
          statusBarOverlayOpacity={overlayOpacity}
          statusBarStyle={isScrolled ? 'dark-content' : 'light-content'}
        />

        {/* 轮播图 - 绝对定位压在背景图上 */}
        <View style={[styles.bannerOverlay, { top: insets.top + 60 }]}>
          <BannerCarousel
            data={Images.bannerImage}
            isFocused={isFocused}
            onPress={(item, index) => {
              console.log('Banner clicked:', item, index);
            }}
          />
        </View>

        {/* 消息列表 */}
        <View style={styles.messageList}>
          <Image
            style={styles.messageIcon}
            source={require('../../assets/images/icon_xiaoxi.png')}
            resizeMode="contain"
          />
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageScroll}
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            automaticallyAdjustContentInsets={false}
            scrollEnabled={false}
          >
            {messages.map(message => (
              <TouchableOpacity
                key={message.id}
                style={styles.messageItem}
                onPress={() => handleMessagePress(message)}
              >
                <Text style={styles.messageText}>{message.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* 余额优惠券内容 */}
        <View style={styles.mainContent}>
          <View style={styles.moneyStyle}>
            <View>
              <Text
                style={[styles.textStyle, styles.textWeight, styles.testSize]}
              >
                {AccountInfo.curBalanceFee}
              </Text>
              <Text style={styles.textStyle}>余额(元)</Text>
            </View>
            <Image
              style={styles.iconStyle}
              source={require('../../assets/images/icon_home_ye.png')}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.moneyStyle, styles.coupon]}>
            <View>
              <Text
                style={[styles.textStyle, styles.textWeight, styles.testSize]}
              >
                {AccountInfo.num}
              </Text>
              <Text style={styles.textStyle}>优惠券</Text>
            </View>
            <Image
              style={styles.iconStyle}
              source={require('../../assets/images/icon_home_yhq.png')}
              resizeMode="contain"
            />
          </View>
        </View>
        {/* 设备类型 */}
        <View style={styles.deviceType}>
          {deviceTypesData.map(item => (
            <View key={item.id} style={styles.deviceTypeText}>
              <Image
                style={styles.deviceTypeImg}
                source={item.image}
                resizeMode="contain"
              />
              <Text>{item.name}</Text>
            </View>
          ))}
        </View>
        {/* 预约 */}
        <Image
          style={styles.YUYUE}
          source={require('../../assets/images/yuyue.png')}
          resizeMode="contain"
        />
        {/* 常用设备 */}
        <View style={styles.box_changyong}>
          <Image
            style={styles.commonImg}
            source={require('../../assets/images/img_cysb_bg.png')}
            resizeMode="contain"
          />
          <View style={styles.common}>
            <LinearGradient
              colors={['#FE8F0A', '#FF510A']} // 对应的起始和结束颜色
              start={{ x: 0, y: 0 }} // 渐变开始点：左上角
              end={{ x: 0, y: 1 }} // 渐变结束点：左下角 (从上到下)
              locations={[0.03, 1.0]} // 对应 3% 和 100%
              style={styles.line}
            />
            <Text style={styles.commonText}>常用设备</Text>
          </View>
        </View>
        <View style={styles.commonList}>
          {commonDevice.map((device, index) => (
            <View
              style={[styles.List, index !== 0 && { marginTop: 10 }]}
              key={device.id}
            >
              <View style={styles.itemList}>
                <Image
                  style={styles.ListIcon}
                  source={require('../../assets/images/icon_dingwei.png')}
                  resizeMode="contain"
                />
                <Text>{device.name}</Text>
              </View>
              <Text>{device.address}</Text>
              <Text style={styles.usageText}>使用</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bannerOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1001, // 确保轮播图在背景图上方
  },
  mainContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  moneyStyle: {
    flex: 1,
    height: 65,
    backgroundColor: '#FFF8EC',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coupon: {
    backgroundColor: '#E9F9F9',
  },
  iconStyle: {
    width: 50,
    height: 50,
  },
  textStyle: {
    color: '#966742',
  },
  textWeight: {
    fontWeight: 'bold',
  },
  testSize: {
    fontSize: 18,
  },
  deviceType: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deviceTypeText: {
    alignItems: 'center',
  },
  deviceTypeImg: {
    width: 40,
    height: 40,
  },

  YUYUE: {
    marginTop: 20,
    marginHorizontal: 20,
    width: width - 40,
    height: 80,
  },

  box_changyong: {
    position: 'relative',
    height: calculatedImageHeight,
    marginTop: 20,
  },
  commonImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    marginHorizontal: 20,
    width: width - 40,
    height: calculatedImageHeight,
    padding: 20,
  },
  common: {
    position: 'absolute',
    top: '50%',
    left: 40,
    transform: [{ translateY: '-50%' }],
    alignItems: 'center',
    flexDirection: 'row',
  },
  line: {
    width: 4,
    height: 15,
    borderRadius: 2,
  },
  commonText: {
    color: '#202131',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  commonList: {
    width: width - 40,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFDFA',
  },
  ListIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  List: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageText: {
    width: 50,
    height: 25,
    backgroundColor: '#FF870A',
    textAlign: 'center',
    lineHeight: 25,
    color: '#fff',
    borderRadius: 15,
  },
  messageList: {
    width: width - 40,
    height: 32,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 8,
    color: '#FF7E38',
    backgroundColor: '#FFF5F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  messageIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  messageScroll: {
    flex: 1,
    height: 32,
  },
  messageItem: {
    height: 32,
    justifyContent: 'center',
  },
  messageText: {
    color: '#FF7E38',
    fontSize: 14,
    lineHeight: 32,
    paddingHorizontal: 5,
  },
});

export default HomeScreen;
