import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';

import { useTheme } from '../hooks/useTheme';
import BannerCarousel from '../components/BannerCarousel';
import HomeHeader from '../components/HomeHeader';
import { Images } from '../assets/images';
import LinearGradient from 'react-native-linear-gradient'; // 导入 LinearGradient
const { width } = Dimensions.get('window');
const COMMON_IMG_ASPECT_RATIO = 106 / 670; // 图片实际宽高比
const calculatedImageHeight = (width - 40) * COMMON_IMG_ASPECT_RATIO;
interface HomeScreenProps {
  // 为将来的导航或其他props预留
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { theme } = useTheme();
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
  const handleTitlePress = () => {
    console.log('项目选择被点击');
    // 这里可以打开项目选择弹窗
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 自定义Header */}
      <HomeHeader projectName="test_01" onTitlePress={handleTitlePress} />

      {/* 轮播图 - 绝对定位压在背景图上 */}
      <View style={styles.bannerOverlay}>
        <BannerCarousel
          data={Images.bannerImage}
          onPress={(item, index) => {
            console.log('Banner clicked:', item, index);
          }}
        />
      </View>

      {/* 页面内容 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 消息列表 */}
        <View style={styles.messageList}>
          <Image
            style={styles.messageIcon}
            source={require('../../assets/images/icon_xiaoxi.png')}
            resizeMode="contain"
          />
          <Text style={{color:'#FF7E38'}}>您有新消息!!!</Text>
        </View>
        {/* 余额优惠券内容 */}
        <View style={styles.mainContent}>
          <View style={styles.moneyStyle}>
            <View>
              <Text
                style={[styles.textStyle, styles.textWeight, styles.testSize]}
              >
                100.00
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
                0
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
          {
            deviceTypesData.map((item) => (
              <View key={item.id} style={styles.deviceTypeText}>
                <Image
                  style={styles.deviceTypeImg}
                  source={item.image}
                  resizeMode="contain"
                />
                <Text>{item.name}</Text>
              </View>
            ))
          }
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
              end={{ x: 0, y: 1 }}   // 渐变结束点：左下角 (从上到下)
              locations={[0.03, 1.0]} // 对应 3% 和 100%
              style={styles.line}
            />
            <Text style={styles.commonText}>常用设备</Text>
          </View>
        </View>
        <View style={styles.commonList}>
          <View style={styles.itemList}>
            <Image
              style={styles.ListIcon}
              source={require('../../assets/images/icon_dingwei.png')}
              resizeMode="contain"
            />
            <Text>洗浴</Text>
          </View>
          <Text>1栋 1层 1-1房间</Text>
          <Text style={styles.usageText}>使用</Text>
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
    top: 60, // 调整这个值来控制轮播图在背景图上的位置
    left: 20,
    right: 20,
    zIndex: 1001, // 确保轮播图在背景图上方
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  moneyStyle: {
    width: 150,
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
    flexDirection:'row',
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

  YUYUE:{
    marginTop: 20,
    marginHorizontal:20,
    width: width - 40,
    height: 80,
  },

  box_changyong:{
    position: 'relative',
    height: calculatedImageHeight,
    marginTop: 20,
  },
  commonImg:{
    position: 'absolute',
    top: 0,
    left: 0,
    marginHorizontal:20,
    width: width - 40,
    height: calculatedImageHeight,
    padding: 20,
  },
  common:{
    position: 'absolute',
    top: '50%',
    left: 40,
    transform: [{ translateY: '-50%' }],
    alignItems: 'center',
    flexDirection: 'row',
  },
  line:{
    width: 4,
    height: 15,
    borderRadius: 2,
  },
  commonText:{
    color: '#202131',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  commonList:{
    width: width - 40,
    height:100,
    marginHorizontal:20,
    paddingHorizontal:20,
    backgroundColor: '#FFFDFA',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:'space-between'
  },
  ListIcon:{
    width: 20,
    height: 20,
    marginRight: 5,
  },
  itemList:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageText:{
    width: 50,
    height: 25,
    backgroundColor:'#FF870A',
    textAlign:'center',
    lineHeight: 25,
    color: '#fff',
    borderRadius: 15,
  },
  messageList:{
    width: width - 40,
    height: 32,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    color:'#FF7E38',
    backgroundColor: '#FFF5F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  messageIcon:{
    width: 20,
    height: 20,
    marginRight: 5,
  }
});

export default HomeScreen;
