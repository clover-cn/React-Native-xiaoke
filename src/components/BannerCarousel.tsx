import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

interface BannerItem {
  url: string;
}

interface BannerCarouselProps {
  data: BannerItem[];
  onPress?: (item: BannerItem, index: number) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ data, onPress }) => {

  const carouselRef = useRef<ICarouselInstance>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayTimerRef = useRef<any>(null);

  // 清理定时器
  const clearAutoPlayTimer = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  // 启动自动播放
  const startAutoPlay = () => {
    if (data && data.length > 1) {
      clearAutoPlayTimer();
      console.log('Starting manual autoplay timer');

      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length;
          console.log('Auto switching to index:', nextIndex);

          // 使用ref来滚动到下一张
          if (carouselRef.current) {
            carouselRef.current.scrollTo({ index: nextIndex, animated: true });
          }

          return nextIndex;
        });
      }, 3000); // 3秒切换一次
    }
  };

  // 组件挂载时启动自动播放
  useEffect(() => {
    const timer = setTimeout(() => {
      startAutoPlay();
    }, 1000); // 延迟1秒启动，确保组件完全渲染

    return () => {
      clearTimeout(timer);
      clearAutoPlayTimer();
    };
  }, [data]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearAutoPlayTimer();
    };
  }, []);

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

  // 如果数据为空或只有一项，不显示轮播
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={data.length > 1}
        width={screenWidth - 40} // 335px converted with margins
        height={142} // 285rpx converted to dp
        autoPlay={false} // 禁用内置自动播放，使用手动控制
        data={data}
        scrollAnimationDuration={800}
        renderItem={renderItem}
        style={styles.carousel}
        enabled={true}
        pagingEnabled={true}
        snapEnabled={true}
        onSnapToItem={(index) => {
          console.log('Carousel snapped to index:', index);
          setCurrentIndex(index);
        }}
        onScrollStart={() => {
          console.log('Carousel scroll started');
          // 用户开始滑动时暂停自动播放
          clearAutoPlayTimer();
        }}
        onScrollEnd={() => {
          console.log('Carousel scroll ended');
          // 滑动结束后重新启动自动播放
          setTimeout(() => {
            startAutoPlay();
          }, 2000); // 2秒后重新启动
        }}
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
