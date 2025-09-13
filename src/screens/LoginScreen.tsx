import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomHeader from '../components/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin?: () => void; // 可选：用于开发时返回主界面
}

const NAV_BAR_HEIGHT = 200;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [agree, setAgree] = React.useState(true);

  // Header 和覆盖内容的布局参数，与 MyScreen 一致
  const overlayTop = insets.top + 120;
  const headerHeight = insets.top + NAV_BAR_HEIGHT;
  const [cardHeight, setCardHeight] = React.useState(0);
  const extraPadding = Math.max(0, overlayTop + cardHeight - headerHeight);

  const handleSendCode = () => {
    console.log('发送验证码');
  };

  const handleLogin = () => {
    console.log('登录');
    onLogin && onLogin();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.headerWrapper, { height: headerHeight + extraPadding }]}
      >
        <CustomHeader
          backgroundImage={require('../../assets/images/img_my_bg.png')}
          contentStartFromStatusBar={true}
          statusBarTranslucent={true}
          statusBarStyle="light-content"
        />

        {/* 覆盖在 Header 上的内容 */}
        <View
          style={[styles.overlayContent, { top: overlayTop }]}
          onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.card}>
            {/* 顶部头像 */}
            <View style={styles.avatarWrap}>
              <Image
                source={require('../../assets/images/img_touxiang.png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>

            {/* 输入区域 */}
            <View style={{ width: '100%', marginTop: 8 }}>
              {/* 手机号 */}
              <View style={styles.inputRow}>
                <View style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor="#B3B3B3"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* 验证码 */}
              <View style={[styles.inputRow, { marginTop: 16 }]}
              >
                <View style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="请输入验证码"
                  placeholderTextColor="#B3B3B3"
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />
                <TouchableOpacity onPress={handleSendCode} activeOpacity={0.8}
                  style={{ marginLeft: 8 }}
                >
                  <View style={styles.codeButton} >
                    <Text style={styles.codeButtonText}>发送验证码</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 登录按钮 */}
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={{ marginTop: 24 }}>
                <LinearGradient
                  colors={["#FF8A00", "#FF5E00"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>登录</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* 协议 */}
              <TouchableOpacity
                onPress={() => setAgree(!agree)}
                activeOpacity={0.8}
                style={styles.agreementRow}
              >
                <View style={[styles.checkbox, agree && styles.checkboxChecked]} />
                <Text style={styles.agreementText}>
                  我同意小程序使用我所提交的信息用于账户开通，并已查看
                  <Text style={styles.link}>《用户服务协议》</Text>
                  及
                  <Text style={styles.link}>《个人信息保护政策》</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerWrapper: {
    position: 'relative',
  },
  headerContent: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlayContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1001,
  },
  card: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: -80,
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF',
  },
  inputRow: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F4F6F8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D9DEE5',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  codeButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeButtonText: {
    color: '#FF6600',
    fontSize: 12,
  },
  loginButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
  },
  agreementText: {
    flex: 1,
    color: '#4A4A4A',
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: '#FF6B35',
  },
});

export default LoginScreen;

