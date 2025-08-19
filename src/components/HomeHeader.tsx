import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import CustomHeader from './CustomHeader';

const { width } = Dimensions.get('window');

interface HomeHeaderProps {
  projectName?: string;
  onTitlePress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  projectName = '暂无项目',
  onTitlePress,
}) => {
  return (
    <CustomHeader
      backgroundImage={require('../../assets/images/img_home_bg1.png')}
      onTitlePress={onTitlePress}
      contentStartFromStatusBar={true}
    >
      {/* 完全自定义首页Header内容 - 使用绝对定位紧贴状态栏 */}
      <TouchableOpacity
        style={styles.titleBar}
        onPress={onTitlePress}
        activeOpacity={0.7}
      >
        <Image
          style={styles.iconTubiao}
          source={require('../../assets/images/icon_tubiao.png')}
          resizeMode="contain"
        />
        <Text style={styles.titleXm} numberOfLines={1}>
          {projectName}
        </Text>
        {/* <Image
          style={styles.xiangyou1}
          source={require('../../assets/images/icon_tubiao.png')}
          resizeMode="contain"
        /> */}
      </TouchableOpacity>
    </CustomHeader>
  );
};

const styles = StyleSheet.create({
  titleBar: {
    position: 'absolute',         // 绝对定位
    top: 20,                       // 紧贴导航栏内容区域顶部
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,        // 水平内边距
    paddingVertical: 8,           // 垂直内边距
    zIndex: 10,                   // 确保在背景图上方
    // backgroundColor:'red'
  },
  iconTubiao: {
    width: 32, // 64rpx converted
    height: 32,
    marginRight: 12, // 24rpx converted
  },
  titleXm: {
    fontSize: 18, // 36rpx converted
    fontWeight: 'bold',
    color: '#ffffff',
    maxWidth: 200, // 限制最大宽度
    marginRight: 8,
  },
  xiangyou1: {
    width: 22, // 44rpx converted
    height: 22,
  },
});

export default HomeHeader;
