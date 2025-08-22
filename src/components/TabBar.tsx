import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { TabBarImages } from '../assets/tabBarImages';

const { width } = Dimensions.get('window');

interface TabItem {
  key: string;
  title: string;
  icon: any; // require() 返回的图片资源
  activeIcon?: any;
  index: string;
}

interface TabBarProps {
  leftTabs: TabItem[];
  rightTabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string, index: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ leftTabs, rightTabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabbarBox}>
      <View style={styles.tabbarNav}>
        <Image
          source={require('../../assets/images/icon_tab_bg.png')}
          style={styles.tabbarNavImg}
          resizeMode="cover"
        />
        <View style={styles.tabbarBtn}>
          {/* 左侧按钮 */}
          <View style={styles.tabbarBtnFl}>
            {leftTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.btnItem}
                  onPress={() => onTabPress(tab.key, tab.index)}
                >
                  <Image
                    source={isActive ? tab.activeIcon : tab.icon}
                    style={styles.btnItemIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.btnItemText, { color: isActive ? '#FF600A' : '#C8CACB' }]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 中间扫码按钮 */}
          <TouchableOpacity
            style={styles.scanCode}
            onPress={() => onTabPress('scan', '5')}
          >
            <Image
              source={TabBarImages.scan}
              style={styles.scanIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 右侧按钮 */}
          <View style={styles.tabbarBtnFl}>
            {rightTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.btnItem}
                  onPress={() => onTabPress(tab.key, tab.index)}
                >
                  <Image
                    source={isActive ? tab.activeIcon : tab.icon}
                    style={styles.btnItemIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.btnItemText, { color: isActive ? '#FF600A' : '#C8CACB' }]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.secure} />
    </View>
  );
};

const styles = StyleSheet.create({
  tabbarBox: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    zIndex: 9999,
    width: '100%',
  },
  tabbarNav: {
    width: '100%',
    height: 70,
    position: 'relative',
  },
  tabbarNavImg: {
    width: '100%',
    height: 70,
  },
  tabbarBtn: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  secure: {
    width: '100%',
    height: 32, // 64rpx converted to dp
    backgroundColor: '#FFF',
  },
  tabbarBtnFl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnItem: {
    width: 70, // 140rpx converted to dp
    height: 56, // 112rpx converted to dp
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  btnItemIcon: {
    width: 28, // 56rpx converted to dp
    height: 28,
  },
  btnItemText: {
    fontSize: 12, // 24rpx converted to dp
    color: '#FF600A',
  },
  scanCode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -30, // 负的宽度的一半来居中
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  scanIcon: {
    width: 36, // 72rpx converted to dp
    height: 36,
    tintColor: '#ffffff',
  },
});

export default TabBar;
