import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import CustomHeader from '../components/CustomHeader';
import LinearGradient from 'react-native-linear-gradient'; // 渐变库
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
// 获取状态栏高度
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 44;
const ChargeScreen: React.FC = () => {
  const { theme } = useTheme();
  const [selectedAmount, setSelectedAmount] = useState('0.02'); // 默认充值金额
  const [selectedId, setSelectedId] = useState<number>(1); // 选中的项目ID
  const insets = useSafeAreaInsets(); // 获取安全区域边距
  const moneyList = [
    { id: 1, amount: '0.02' },
    { id: 2, amount: '20' },
    { id: 3, amount: '30' },
    { id: 4, amount: '40' },
  ];

  const calculateAmount = (item: any) => {
    console.log('选中的金额:', item);
    setSelectedAmount(item.amount);
    setSelectedId(item.id);
  };
  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      {/* 顶部标题栏 - 使用背景图片 */}
      <CustomHeader
        backgroundImage={require('../../assets/images/img_cz_bj.png')}
        contentStartFromStatusBar={true}
        statusBarTranslucent={true}
        statusBarStyle="dark-content"
      >
        <TouchableOpacity style={[styles.titleBar, { top: insets.top }]} activeOpacity={0.7}>
          <Text style={styles.titleXm}>充值</Text>
        </TouchableOpacity>
        <ImageBackground
          style={[styles.balanceCard, { marginTop: insets.top + 40 }]}
          source={require('../../assets/images/img_zhye.png')}
          resizeMode="contain"
        >
          <Text style={[{ color: '#FFF' }]}>充值金额</Text>
          <Text style={styles.balanceMoney}>
            <Text style={[{ fontWeight: 'normal', fontSize: 18 }]}>￥</Text>{selectedAmount}
          </Text>
        </ImageBackground>
      </CustomHeader>

      <View style={styles.scrollContent}>
        {/* 选择金额标题 */}
        <View style={styles.sectionHeader}>
          <View style={styles.redLine} />
          <Text style={styles.sectionTitle}>选择金额</Text>
        </View>

        {/* 金额选择网格 */}
        <View style={styles.amountGrid}>
          {moneyList.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.amountButton,
                selectedId === item.id && styles.selectedAmount,
              ]}
              onPress={() => calculateAmount(item)}
            >
              <Text
                style={
                  selectedId === item.id ? styles.selectedAmountText : styles.amountText
                }
              >
                ¥{item.amount}
              </Text>
            </TouchableOpacity>
          ))}
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
        <TouchableOpacity style={styles.payButtonContainer}>
          <LinearGradient
            colors={['#FF510A', '#FE8F0A']} // 对应的起始和结束颜色
            locations={[0.03, 1.0]} // 对应 3% 和 100%
            start={{ x: 0, y: 0.5 }} // 渐变开始点：左上角
            end={{ x: 1, y: 0.5 }} // 渐变结束点：左下角 (从上到下)
            style={styles.payButton}
          >
            <Text style={styles.payButtonText}>确认支付</Text>
          </LinearGradient>
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
    zIndex: 1000,
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  balanceCard: {
    width: width - 40,
    height: 120,
    // marginTop: 40,
    marginHorizontal: 20,
    justifyContent: 'center',
    paddingLeft: 40,
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
    backgroundColor: '#FFEFE6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedAmount: {
    backgroundColor: '#FF6B35',
  },
  amountText: {
    fontSize: 18,
    color: '#FF600A',
    fontWeight: 'bold',
  },
  selectedAmountText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
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
  payButtonContainer: {
    marginBottom: 20,
    marginHorizontal: 5, // 为阴影留出空间
    borderRadius: 25,
    // iOS 阴影效果
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    // Android 阴影效果
    elevation: 15,
    // 确保背景色不干扰阴影
    backgroundColor: 'transparent',
  },
  payButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
  balanceMoney: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ChargeScreen;
