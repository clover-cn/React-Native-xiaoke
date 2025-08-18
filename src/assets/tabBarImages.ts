/**
 * TabBar图片资源管理
 *
 * 临时使用网络图片，避免本地图片路径问题
 */

export const TabBarImages = {
  home: {
    normal: require('../../assets/tabBar/icon_home.png'),
    active: require('../../assets/tabBar/icon_home_fill.png')
  },
  charge: {
    normal: require('../../assets/tabBar/icon_cz.png'),
    active: require('../../assets/tabBar/icon_cz_fill.png')
  },
  scan: require('../../assets/tabBar/icon_sm1.png'),
  help: {
    normal: require('../../assets/tabBar/icon_help.png'),
    active: require('../../assets/tabBar/icon_help_fill.png')
  },
  my: {
    normal: require('../../assets/tabBar/icon_my.png'),
    active: require('../../assets/tabBar/icon_my_fill.png')
  }
};

