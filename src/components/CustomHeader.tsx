import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';

const { width } = Dimensions.get('window');

// 获取状态栏高度（简化版本，实际项目建议使用react-native-safe-area-context）
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 44;
const NAV_BAR_HEIGHT = 200;

interface CustomHeaderProps {
  title?: string;
  leftIcon?: ImageSourcePropType;
  rightIcon?: ImageSourcePropType;
  backgroundImage?: ImageSourcePropType;
  backgroundImageResizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  backgroundColor?: string;
  titleColor?: string;
  showBackButton?: boolean;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onTitlePress?: () => void;
  children?: React.ReactNode; // 用于完全自定义内容
  contentStartFromStatusBar?: boolean; // 内容是否从状态栏开始
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  backgroundImage,
  backgroundImageResizeMode = 'cover',
  backgroundColor = '#FF6B35',
  titleColor = '#ffffff',
  showBackButton = false,
  onLeftPress,
  onRightPress,
  onTitlePress,
  children,
  contentStartFromStatusBar = false,
}) => {
  const totalHeight = STATUS_BAR_HEIGHT + NAV_BAR_HEIGHT;
  const containerPaddingTop = contentStartFromStatusBar ? 0 : STATUS_BAR_HEIGHT;

  return (
    <>
      {/* 设置状态栏为透明 */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={[styles.container, { height: totalHeight, paddingTop: containerPaddingTop }]}>
        {/* 背景图片 - 覆盖整个区域包括状态栏 */}
        {backgroundImage && (
          <Image
            source={backgroundImage}
            style={[styles.backgroundImage, { height: totalHeight + STATUS_BAR_HEIGHT }]}
            resizeMode={backgroundImageResizeMode}
          />
        )}

        {/* 背景色 - 覆盖整个区域包括状态栏 */}
        {!backgroundImage && (
          <View style={[styles.backgroundView, { backgroundColor, height: totalHeight }]} />
        )}

        {/* 导航栏内容 */}
        <View style={styles.navBar}>
          {children ? (
            // 完全自定义内容
            children
          ) : (
            // 默认布局
            <>
              {/* 左侧按钮 */}
              <View style={styles.leftContainer}>
                {(showBackButton || leftIcon || onLeftPress) && (
                  <TouchableOpacity
                    style={styles.sideButton}
                    onPress={onLeftPress}
                    activeOpacity={0.7}
                  >
                    {leftIcon ? (
                      <Image source={leftIcon} style={styles.sideIcon} resizeMode="contain" />
                    ) : showBackButton ? (
                      <Text style={[styles.backText, { color: titleColor }]}>←</Text>
                    ) : null}
                  </TouchableOpacity>
                )}
              </View>

              {/* 中间标题 */}
              <TouchableOpacity
                style={styles.titleContainer}
                onPress={onTitlePress}
                activeOpacity={onTitlePress ? 0.7 : 1}
                disabled={!onTitlePress}
              >
                <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                  {title || ''}
                </Text>
              </TouchableOpacity>

              {/* 右侧按钮 */}
              <View style={styles.rightContainer}>
                {(rightIcon || onRightPress) && (
                  <TouchableOpacity
                    style={styles.sideButton}
                    onPress={onRightPress}
                    activeOpacity={0.7}
                  >
                    {rightIcon && (
                      <Image source={rightIcon} style={styles.sideIcon} resizeMode="contain" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    zIndex: 1000,
  },
  backgroundImage: {
    position: 'absolute',
    top: -STATUS_BAR_HEIGHT, // 向上延伸到状态栏
    left: 0,
    width: '100%',
  },
  backgroundView: {
    position: 'absolute',
    top: -STATUS_BAR_HEIGHT, // 向上延伸到状态栏
    left: 0,
    width: '100%',
  },
  navBar: {
    height: NAV_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sideButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideIcon: {
    width: 24,
    height: 24,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
