import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';
const HelpScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* 状态栏配置（可控透明与背景色） */}
      <CustomHeader
        contentStartFromStatusBar={true}
        statusBarStyle="dark-content"
        navHeight={20}
      >
        <TouchableOpacity style={styles.titleBar} activeOpacity={0.7}>
          <Text style={styles.titleXm}>帮助</Text>
        </TouchableOpacity>
      </CustomHeader>
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          帮助页面开发中...
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
    backgroundColor: 'red',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  titleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    zIndex: 10,
    backgroundColor: 'red',
  },
  titleXm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131212ff',
    maxWidth: 200,
  },
});

export default HelpScreen;
