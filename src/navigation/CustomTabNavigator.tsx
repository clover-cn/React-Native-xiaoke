import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarImages } from '../assets/tabBarImages';

const { width } = Dimensions.get('window');

interface CustomTabNavigatorProps extends BottomTabBarProps {
  onScanPress: () => void;
  hidden?: boolean;
}

const CustomTabNavigator: React.FC<CustomTabNavigatorProps> = ({ 
  state, 
  descriptors, 
  navigation,
  onScanPress,
  hidden = false,
}) => {
  if (hidden) {
    return null;
  }
  const tabConfig = [
    {
      key: 'Home',
      title: '首页',
      icon: TabBarImages.home.normal,
      activeIcon: TabBarImages.home.active,
    },
    {
      key: 'Charge',
      title: '充值',
      icon: TabBarImages.charge.normal,
      activeIcon: TabBarImages.charge.active,
    },
    null, // 中间扫码位置
    {
      key: 'Help',
      title: '帮助',
      icon: TabBarImages.help.normal,
      activeIcon: TabBarImages.help.active,
    },
    {
      key: 'My',
      title: '我的',
      icon: TabBarImages.my.normal,
      activeIcon: TabBarImages.my.active,
    },
  ];

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
            {tabConfig.slice(0, 2).map((tab, index) => {
              if (!tab) return null;
              
              const route = state.routes[index];
              const isFocused = state.index === index;
              
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.btnItem}
                  onPress={onPress}
                >
                  <Image
                    source={isFocused ? tab.activeIcon : tab.icon}
                    style={styles.btnItemIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.btnItemText, { color: isFocused ? '#FF600A' : '#C8CACB' }]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 中间扫码按钮 */}
          <TouchableOpacity
            style={styles.scanCode}
            onPress={onScanPress}
          >
            <Image
              source={TabBarImages.scan}
              style={styles.scanIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 右侧按钮 */}
          <View style={styles.tabbarBtnFl}>
            {tabConfig.slice(3).map((tab, index) => {
              if (!tab) return null;
              
              const routeIndex = index + 2; // 调整索引（跳过中间的扫码）
              const route = state.routes[routeIndex];
              const isFocused = state.index === routeIndex;
              
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.btnItem}
                  onPress={onPress}
                >
                  <Image
                    source={isFocused ? tab.activeIcon : tab.icon}
                    style={styles.btnItemIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.btnItemText, { color: isFocused ? '#FF600A' : '#C8CACB' }]}>
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
    height: 32,
    backgroundColor: '#FFF',
  },
  tabbarBtnFl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnItem: {
    width: 70,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  btnItemIcon: {
    width: 28,
    height: 28,
  },
  btnItemText: {
    fontSize: 12,
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
    marginLeft: -30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  scanIcon: {
    width: 36,
    height: 36,
    tintColor: '#ffffff',
  },
});

export default CustomTabNavigator;