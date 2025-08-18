import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

interface BannerItem {
  url: string;
}

interface BannerCarouselProps {
  data: BannerItem[];
  onPress?: (item: BannerItem, index: number) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ data, onPress }) => {
  const renderItem = ({ item, index }: { item: BannerItem; index: number }) => {
    return (
      <TouchableOpacity
        style={styles.carouselItem}
        onPress={() => onPress?.(item, index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={screenWidth - 40} // 335px converted with margins
        height={142} // 285rpx converted to dp
        autoPlay={true}
        data={data}
        scrollAnimationDuration={1500}
        autoPlayInterval={5000}
        renderItem={renderItem}
        style={styles.carousel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  carousel: {
    borderRadius: 12,
  },
  carouselItem: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default BannerCarousel;
