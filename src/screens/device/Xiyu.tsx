import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  StatusBar,
  Image,
} from 'react-native';
import apiService from '../../services/api';
import RadioGroup from '../../components/RadioGroup';
import Radio from '../../components/Radio';
import { goBack } from '../../services/navigationService';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Xiyu: React.FC = () => {
  const insets = useSafeAreaInsets(); // 获取安全区域边距
  useEffect(() => {
    console.log('======>',insets);
    
  }, []);
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
          <Text>空闲</Text>
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
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <LinearGradient
            colors={['#FF510A', '#FE8F0A']} // 对应的起始和结束颜色
            locations={[0.03, 1.0]} // 对应 3% 和 100%
            start={{ x: 0, y: 0.5 }} // 渐变开始点：左上角
            end={{ x: 1, y: 0.5 }} // 渐变结束点：左下角 (从上到下)
            style={styles.consumeStart}
          >
            <Text style={styles.consumeText}>开始消费</Text>
          </LinearGradient>
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

  consumeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Xiyu;
