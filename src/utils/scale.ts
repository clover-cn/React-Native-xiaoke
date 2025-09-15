//  适配不同屏幕尺寸的工具函数
import { Dimensions, PixelRatio } from 'react-native';
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) => width / guidelineBaseWidth * size; // 横向缩放
export const vScale = (size: number) => height / guidelineBaseHeight * size; // 纵向缩放
// 适度缩放，避免过度放大/缩小
export const mScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// 对齐到像素网格，减少“半像素”导致的毛边/错位
export const px = (size: number) => PixelRatio.roundToNearestPixel(size);
