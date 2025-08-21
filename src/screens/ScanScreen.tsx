import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Vibration,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useScan } from '../contexts/ScanContext';

const ScanScreen: React.FC = () => {
  const { stopScan, onScanResult, onScanCancel } = useScan();
  const [isScanning, setIsScanning] = useState(true);

  const onSuccess = (e: any) => {
    if (!isScanning) return;

    setIsScanning(false);

    // 安全的震动反馈
    try {
      Vibration.vibrate(100);
    } catch (error) {
      console.log('震动权限未授予:', error);
    }

    const data = e.data;
    console.log('组件扫码结果:', data);

    // 调用回调函数并关闭扫码界面
    if (onScanResult) {
      onScanResult(data);
    }
    stopScan();
  };

  const handleBack = () => {
    // 调用取消回调并关闭扫码界面
    if (onScanCancel) {
      onScanCancel();
    }
    stopScan();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* 相机组件 */}
      <Camera
        style={styles.camera}
        cameraType={CameraType.Back}
        onReadCode={(event) => onSuccess({ data: event.nativeEvent.codeStringValue })}
        scanBarcode={true}
        showFrame={true}
        frameColor="#FF6B35"
        laserColor="#FF6B35"
      />

      {/* 顶部覆盖层 */}
      <View style={styles.topOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>扫一扫</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 底部覆盖层 */}
      <View style={styles.bottomOverlay}>
        <Text style={styles.instruction}>
          将二维码放入框内，即可自动扫描
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ScanScreen;
