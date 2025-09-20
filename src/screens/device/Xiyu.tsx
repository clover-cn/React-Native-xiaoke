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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Xiyu;
