import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView 
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const MyScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          我的 👤
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          个人中心页面开发中...
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

export default MyScreen;
