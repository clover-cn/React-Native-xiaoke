# 项目结构说明

## 📁 目录结构

```
src/
├── components/          # 可复用的UI组件
│   └── Button.tsx      # 通用按钮组件
├── screens/            # 页面组件
│   ├── HomeScreen.tsx  # 首页
│   └── AboutScreen.tsx # 关于页面
├── navigation/         # 导航相关
│   └── AppNavigator.tsx # 简单的页面导航器
├── hooks/              # 自定义Hooks
│   └── useTheme.ts     # 主题Hook
├── theme/              # 主题配置
│   └── colors.ts       # 颜色配置
└── index.ts            # 统一导出文件
```

## 🎯 设计理念

### 1. 模块化设计
- 每个功能都被拆分成独立的模块
- 便于维护和扩展
- 代码复用性高

### 2. 组件化
- UI组件可复用
- 统一的设计风格
- 易于测试

### 3. 主题系统
- 支持深色/浅色模式
- 统一的颜色管理
- 响应系统主题变化

## 🚀 如何添加新页面

### 步骤1: 创建新的Screen组件
在 `src/screens/` 目录下创建新文件，例如 `ProfileScreen.tsx`:

```typescript
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        个人资料
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
```

### 步骤2: 更新导航器
在 `src/navigation/AppNavigator.tsx` 中添加新页面:

```typescript
// 1. 导入新页面
import ProfileScreen from '../screens/ProfileScreen';

// 2. 更新Screen类型
type Screen = 'Home' | 'About' | 'Profile';

// 3. 在renderScreen方法中添加case
case 'Profile':
  return <ProfileScreen />;
```

### 步骤3: 添加导航按钮
在需要的地方添加导航到新页面的按钮。

## 🎨 如何添加新组件

### 步骤1: 创建组件文件
在 `src/components/` 目录下创建新组件。

### 步骤2: 导出组件
在 `src/index.ts` 中添加导出:

```typescript
export { default as YourNewComponent } from './components/YourNewComponent';
```

## 🎭 主题使用

使用 `useTheme` Hook 获取当前主题:

```typescript
import { useTheme } from '../hooks/useTheme';

const YourComponent = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello</Text>
    </View>
  );
};
```

## 📱 推荐的扩展方向

1. **添加React Navigation**: 用于更复杂的导航需求
2. **状态管理**: 使用Redux或Zustand管理全局状态
3. **网络请求**: 添加API调用和数据管理
4. **本地存储**: 使用AsyncStorage保存用户数据
5. **动画**: 使用React Native Reanimated添加动画效果

## 🛠️ 开发建议

1. 保持组件的单一职责原则
2. 使用TypeScript提供类型安全
3. 遵循一致的命名规范
4. 为组件编写适当的Props接口
5. 考虑组件的可复用性和可测试性
