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
const Xiyu: React.FC = () => {
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <Image
        style={{ width: '100%', height: 300 }}
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
});

export default Xiyu;
