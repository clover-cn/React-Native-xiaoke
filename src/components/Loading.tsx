import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';

interface LoadingProps {
  visible: boolean;
  title?: string;
  mask?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  visible, 
  title = '加载中...', 
  mask = true 
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={[styles.container, !mask && styles.noMask]}>
        <View style={styles.loadingBox}>
          <ActivityIndicator 
            size="large" 
            color="#007AFF" 
            style={styles.spinner}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明遮罩
  },
  noMask: {
    backgroundColor: 'transparent',
  },
  loadingBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  spinner: {
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Loading;