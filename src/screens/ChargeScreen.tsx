import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';

const ChargeScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader
        title="充值"
        backgroundColor="#FF6B35"
        showBackButton={false}
      />
      <ScrollView style={styles.content}>
        <View style={styles.contentInner}>
          <Text style={[styles.title, { color: theme.text }]}>
            充值 💳
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            充值页面开发中...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentInner: {
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

export default ChargeScreen;
