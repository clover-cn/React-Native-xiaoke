import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';
const { width } = Dimensions.get('window');
// 获取状态栏高度
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 44;
const ChargeScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      {/* 顶部标题栏 - 使用背景图片 */}
      <CustomHeader
        backgroundImage={require('../../assets/images/img_cz_bj.png')}
        contentStartFromStatusBar={true}
        statusBarTranslucent={true}
        statusBarStyle="dark-content"
      >
        <TouchableOpacity style={styles.titleBar} activeOpacity={0.7}>
          <Text style={styles.titleXm}>充值</Text>
        </TouchableOpacity>
        <Image
          style={styles.balanceCard}
          source={require('../../assets/images/img_zhye.png')}
          resizeMode="contain"
        />
      </CustomHeader>

      <View
        style={styles.scrollContent}
      >
        {/* 选择金额标题 */}
        <View style={styles.sectionHeader}>
          <View style={styles.redLine} />
          <Text style={styles.sectionTitle}>选择金额</Text>
        </View>

        {/* 金额选择网格 */}
        <View style={styles.amountGrid}>
          <TouchableOpacity
            style={[styles.amountButton, styles.selectedAmount]}
          >
            <Text style={styles.selectedAmountText}>¥0.01</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountText}>¥20</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountText}>¥30</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.amountButton}>
            <Text style={styles.amountText}>¥40</Text>
          </TouchableOpacity>
        </View>

        {/* 充值说明 */}
        <View style={styles.noteSection}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteIcon}>💡</Text>
            <Text style={styles.noteTitle}>充值说明</Text>
          </View>
          <Text style={styles.noteText}>
            1. 如有疑问，可可直接与客服人员电话沟通"18117830256"
          </Text>
        </View>

        {/* 确认支付按钮 */}
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>确认支付</Text>
        </TouchableOpacity>

        {/* 为他人下充值 */}
        <TouchableOpacity style={styles.otherChargeButton}>
          <Text style={styles.otherChargeText}>为他人下充值</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    zIndex: 10,
    // backgroundColor: 'red',
  },
  titleXm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131212ff',
    maxWidth: 200,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + 20 + 120, // 顶部状态栏高度 + 标题栏高度
    zIndex: 9999,
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  balanceCard: {
    width: width - 40,
    height: 120,
    marginTop: 40,
    marginHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  redLine: {
    width: 3,
    height: 16,
    backgroundColor: '#FF6B35',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  amountButton: {
    width: (width - 60) / 2,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAmount: {
    backgroundColor: '#FF6B35',
  },
  amountText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedAmountText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  noteSection: {
    marginBottom: 30,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  noteTitle: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  payButton: {
    backgroundColor: '#FF6B35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  otherChargeButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 30,
  },
  otherChargeText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ChargeScreen;
