# 图片资源目录

## 📁 目录结构

```
assets/
├── images/
│   ├── icons/          # 图标文件
│   │   ├── home.png
│   │   ├── profile.png
│   │   └── settings.png
│   ├── backgrounds/    # 背景图片
│   │   ├── splash.png
│   │   └── header-bg.png
│   ├── logos/          # Logo文件
│   │   ├── app-logo.png
│   │   └── company-logo.png
│   └── common/         # 通用图片
│       ├── placeholder.png
│       └── default-avatar.png
├── fonts/              # 字体文件
└── videos/             # 视频文件
```

## 📱 不同分辨率支持

React Native支持多分辨率图片，建议提供以下尺寸：

```
assets/images/
├── logo.png          # 1x (基础尺寸)
├── logo@2x.png       # 2x (高分辨率)
└── logo@3x.png       # 3x (超高分辨率)
```

## 🎯 使用方式

```typescript
// 在组件中引用图片
import { Image } from 'react-native';

// 方式1: require引用
<Image source={require('../../assets/images/logo.png')} />

// 方式2: 网络图片
<Image source={{ uri: 'https://example.com/image.png' }} />
```
