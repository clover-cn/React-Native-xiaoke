import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';
import LinearGradient from 'react-native-linear-gradient'; // 渐变库
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

interface MyScreenProps {
  onLogout?: () => void;
}

const MyScreen: React.FC<MyScreenProps> = ({ onLogout }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // 获取安全区域边距
  const featureList = [
    {
      name: '完善资料',
      icon: require('../../assets/images/icon_wdzh.png'),
    },
    {
      name: '退出登录',
      icon: require('../../assets/images/icon_qcsq.png'),
    },
  ];

  // Header 和覆盖内容的布局参数
  const NAV_BAR_HEIGHT = 200; // 与 CustomHeader 默认 navHeight 保持一致
  const overlayTop = insets.top + 130; // 覆盖内容距离顶部偏移
  const headerHeight = insets.top + NAV_BAR_HEIGHT; // Header 实际高度
  const [userContentHeight, setUserContentHeight] = React.useState(0);
  const extraPadding = Math.max(0, overlayTop + userContentHeight - headerHeight);
  const TABBAR_VISIBLE_HEIGHT = 72 + insets.bottom; // 底部 TabBar 可见高度
  const handleTitlePress = () => {
    console.log('被点击');
  };
  const handleFunctionPress = (item: any) => {
    if (item?.name === '退出登录') {
      // 回调给上层：退出到登录页
      onLogout && onLogout();
      return;
    }
    console.log('功能被点击:', item);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: TABBAR_VISIBLE_HEIGHT }}>
      {/* 头部区域包装，使 Header 与覆盖内容一起滚动并参与布局高度 */}
      <View style={[styles.headerWrapper, { height: headerHeight + extraPadding }]}>
        {/* 自定义Header */}
        <CustomHeader
          backgroundImage={require('../../assets/images/img_my_bg.png')}
          contentStartFromStatusBar={true}
          statusBarTranslucent={true}
          statusBarStyle="light-content"
        >
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Image
                source={require('../../assets/images/img_touxian_boy.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>秦始皇</Text>
            </View>
            <LinearGradient
              colors={['#FFD500', '#FC9D0F']} // 颜色数组
              start={{ x: 0, y: 0.5 }} // 从左边缘中间开始
              end={{ x: 1, y: 0.5 }} // 到右边缘中间结束
              locations={[0.02, 1.0]} // 对应 CSS 中的 2% 和 100%
              style={styles.consumed}
            >
              <Image
                source={require('../../assets/images/icon_xmewmxz.png')}
                style={styles.consumedImage}
                resizeMode="contain"
              />
              <Text style={styles.headerSubtitle}>消费码</Text>
            </LinearGradient>
          </View>
        </CustomHeader>

        {/* 覆盖在 Header 上的内容 */}
        <View
          style={[styles.userContent, { top: overlayTop }]}
          onLayout={(e) => setUserContentHeight(e.nativeEvent.layout.height)}
        >
        <ImageBackground
          source={require('../../assets/images/icon_zhxx.png')}
          resizeMode="contain"
          style={styles.accountBalance}
        >
          <View style={styles.accountInfo}>
            <Text style={{ fontWeight: 'bold', marginRight: 80 }}>
              账户信息
            </Text>
            <View style={styles.accountDetails}>
              <View style={styles.accountItem}>
                <Image
                  source={require('../../assets/images/icon_xmwz.png')}
                  resizeMode="contain"
                  style={{ width: 20, height: 20 }}
                />
                <Text style={{ color: '#ffffff', marginLeft: 5 }}>
                  测试项目
                </Text>
              </View>
              <Image
                source={require('../../assets/images/icon_xiangyou_my.png')}
                resizeMode="contain"
                style={{ width: 20, height: 20 }}
              />
            </View>
          </View>
          <View style={styles.moneyInfo}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                <Text style={{ fontWeight: 'normal', fontSize: 12 }}>￥</Text>
                <Text>10.00</Text>
              </Text>
              <Text>余额</Text>
            </View>
            <View style={styles.line}></View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                <Text style={{ fontWeight: 'normal', fontSize: 12 }}>￥</Text>
                <Text>0</Text>
              </Text>
              <Text>优惠券</Text>
            </View>
          </View>
        </ImageBackground>
        <View style={styles.contentList}>
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>常用功能</Text>
          <View style={styles.functionContainer}>
            {featureList.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.functionList} 
                onPress={() => handleFunctionPress(item)}
                activeOpacity={0.5}
              >
                <Image
                  source={item.icon}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#636467', fontSize: 12, marginTop: 5 }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    flex: 1,
  },
  headerWrapper: {
    position: 'relative',
  },
  headerContent: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  consumed: {
    width: 90,
    height: 35,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedImage: {
    width: 15,
    height: 15,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
  },
  userContent: {
    position: 'absolute',
    left: 20,
    zIndex: 9999,
  },
  accountBalance: {
    width: width - 40,
    height: 150,
    padding: 25,
  },
  contentList: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
  },
  accountInfo: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moneyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  line: {
    width: 1,
    height: 30,
    backgroundColor: '#E8E8E9',
  },
  functionContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  functionList: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    marginBottom: 20,
  },
});

export default MyScreen;
