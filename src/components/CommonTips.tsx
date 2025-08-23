import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Responsive scaling based on a design width (e.g., 750px)
const rpx = (px: number) => {
  return (width / 750) * px;
};

interface CommonTipsProps {
  commonTips: {
    title: string;
    content: string[];
  };
}

const CommonTips: React.FC<CommonTipsProps> = ({
  commonTips = { title: '', content: [] },
}) => {
  return (
    <View style={styles.set_warp_desc}>
      <View style={styles.set_warp_desc_title}>
        <View style={styles.set_warp_desc_title_img}>
          <Image
            style={styles.image}
            source={require('../../assets/images/icon_wxts.png')}
          />
        </View>
        <Text style={styles.set_warp_desc_title_text}>{commonTips.title}</Text>
      </View>
      <View style={styles.set_warp_desc_content}>
        {commonTips.content.map((item, index) => (
          <View style={styles.set_warp_desc_content_item} key={index}>
            <Text style={styles.set_warp_desc_content_item_left}>
              {index + 1}
            </Text>
            <Text style={styles.set_warp_desc_content_item_right}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  set_warp_desc: {
    width: '100%',
  },
  set_warp_desc_title: {
    width: '100%',
    height: rpx(44),
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: rpx(24),
  },
  set_warp_desc_title_img: {
    width: rpx(44),
    height: rpx(44),
    marginRight: rpx(4),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  set_warp_desc_title_text: {
    fontSize: rpx(28),
    color: '#202125',
    lineHeight: rpx(38),
  },
  set_warp_desc_content: {
    width: '100%',
  },
  set_warp_desc_content_item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: rpx(17),
    marginLeft: rpx(10),
  },
  set_warp_desc_content_item_left: {
    minWidth: rpx(32),
    height: rpx(32),
    textAlign: 'center',
    lineHeight: rpx(32),
    borderRadius: rpx(16),
    color: '#0177fb',
    backgroundColor: 'rgba(1, 119, 251, 0.1)',
    marginRight: rpx(12),
    overflow: 'hidden', // Ensures the background respects the border radius on Android
  },
  set_warp_desc_content_item_right: {
    color: '#677c93',
    lineHeight: rpx(32),
    flexShrink: 1, // Allow text to wrap
  },
});

export default CommonTips;