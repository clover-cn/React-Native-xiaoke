import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';
import LinearGradient from 'react-native-linear-gradient'; // 渐变库
const { width } = Dimensions.get('window');
const MyScreen: React.FC = () => {
  const { theme } = useTheme();
  const handleTitlePress = () => {
    console.log('被点击');
  };
  return (
    <ScrollView style={styles.container}>
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
      <View style={styles.userContent}>
        <ImageBackground
          source={require('../../assets/images/icon_zhxx.png')}
          resizeMode="contain"
          style={styles.accountBalance}
        >
          <View style={styles.accountInfo}>
            <Text style={{ fontWeight: 'bold' }}>账户信息</Text>
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
        </ImageBackground>
        <View style={styles.contentList}>
          <Text>这是列表区域</Text>
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
    top: 150,
    left: 20,
    zIndex: 9999,
  },
  accountBalance: {
    width: width - 40,
    height: 150,
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    padding: 25,
  },
  contentList: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  accountInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountDetails: {
    width: '55%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
});

export default MyScreen;
