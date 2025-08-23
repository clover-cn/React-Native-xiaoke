import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Responsive scaling based on a design width (e.g., 750px)
const rpx = (px: number) => {
  return (width / 750) * px;
};

interface NoContentProps {
  show?: boolean;
}

const NoContent: React.FC<NoContentProps> = ({ show = true }) => {
  if (!show) {
    return null;
  }

  return (
    <View style={styles.empty}>
      <View style={styles.empty_img}>
        <Image
          style={styles.img}
          source={require('../../assets/images/icon_xy_kym.png')}
        />
        <Text style={styles.text}>暂无内容</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty_img: {
    alignItems: 'center',
    position: 'relative',
  },
  img: {
    width: rpx(440),
    height: rpx(440),
  },
  text: {
    position: 'absolute',
    bottom: rpx(95),
    fontSize: rpx(32),
    color: '#636467',
  },
});

export default NoContent;