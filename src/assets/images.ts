/**
 * 图片资源统一管理
 *
 * 使用方式:
 * import { Images } from '../assets/images';
 * <Image source={Images.logo} />
 */

export const Images = {
  // Logo相关
  logo: require('../../assets/images/icon_home_ye.png'),
  companyLogo: require('../../assets/images/icon_home_ye.png'),

  // 图标相关
  icons: {
    home: require('../../assets/images/icon_home_ye.png'),
    profile: require('../../assets/images/icon_home_ye.png'),
    settings: require('../../assets/images/icon_home_ye.png'),
    back: require('../../assets/images/icon_home_ye.png'),
    menu: require('../../assets/images/icon_home_ye.png'),
  },

  // 背景图片
  backgrounds: {
    splash: require('../../assets/images/icon_home_ye.png'),
    headerBg: require('../../assets/images/icon_home_ye.png'),
  },

  // 通用图片
  common: {
    placeholder: require('../../assets/images/icon_home_ye.png'),
    defaultAvatar: require('../../assets/images/icon_home_ye.png'),
  },

  // 轮播图
  bannerImage: [
    {
      url: 'https://zytx-plat-manager.obs.cn-southwest-2.myhuaweicloud.com/title/img_banner_home.png',
    },
    {
      url: 'https://zytx-plat-manager.obs.cn-southwest-2.myhuaweicloud.com/title/img_banner_home1.png',
    },
    {
      url: 'https://zytx-plat-manager.obs.cn-southwest-2.myhuaweicloud.com/title/img_banner_home2.png',
    },
  ]
};

// 类型定义，提供更好的TypeScript支持
export type ImageKeys = keyof typeof Images;
export type IconKeys = keyof typeof Images.icons;
export type BackgroundKeys = keyof typeof Images.backgrounds;
export type CommonKeys = keyof typeof Images.common;
