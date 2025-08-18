import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { useTheme } from '../hooks/useTheme';
import BannerCarousel from '../components/BannerCarousel';
import { Images } from '../assets/images';

const { width } = Dimensions.get('window');
interface HomeScreenProps {
  // 为将来的导航或其他props预留
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>首页</Text>
        <BannerCarousel
          data={Images.bannerImage}
          onPress={(item, index) => {
            console.log('Banner clicked:', item, index);
          }}
        />
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          开发中...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
