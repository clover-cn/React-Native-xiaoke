



# 扫码使用指南

```jsx
import { useScan } from '../contexts/ScanContext';
import { openScanScreen } from '../services/navigationService';

const { startScan } = useScan();

// 启动扫码函数
const startScanFromHome = () => {
   console.log('启动扫码');
   const onResult = (data: string) => {
     console.log('扫码结果:', data);
   };
   const onCancel = () => {
     console.log('扫码取消');
   };
   // 设置回调并更新全局扫码状态
   startScan(onResult, onCancel);
   // 在独立页面（如 ProjectList）中，使用路由打开扫码页
   openScanScreen(onResult, onCancel);
};
```



# React Navigation 使用指南

> 本文档详细介绍本项目中 React Navigation 的使用方法和最佳实践

## 📁 项目导航架构

### 导航层级结构
```
App (NavigationContainer)
└── RootStackNavigator (AppNavigator)
    ├── Auth (AuthNavigator - Stack)
    │   └── Login (LoginScreen)
    ├── Main (MainTabNavigator - BottomTab)
    │   ├── Home (HomeScreen)
    │   ├── Charge (ChargeScreen) 
    │   ├── Help (HelpScreen)
    │   └── My (MyScreen)
    └── Scan (ScanScreen - Modal)
```

### 核心文件结构
```
src/navigation/
├── AppNavigator.tsx      # 根导航器
├── AuthNavigator.tsx     # 认证导航器
├── MainTabNavigator.tsx  # 主Tab导航器
├── CustomTabNavigator.tsx # 自定义TabBar
└── types.ts             # 路由类型定义

src/services/
└── navigationService.ts # 全局导航服务
```

## 🔧 基础概念

### 1. 导航器类型

#### Stack Navigator - 栈导航
```typescript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator<RootStackParamList>();

// 特点：页面叠加，支持返回
<Stack.Navigator>
  <Stack.Screen name="Auth" component={AuthNavigator} />
  <Stack.Screen name="Main" component={MainTabNavigator} />
</Stack.Navigator>
```

#### Tab Navigator - 标签导航  
```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<MainTabParamList>();

// 特点：底部标签，页面切换
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Charge" component={ChargeScreen} />
</Tab.Navigator>
```

### 2. 路由类型定义

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList; params?: any } | undefined;
  Scan: { onResult?: (data: string) => void; onCancel?: () => void };
};

export type MainTabParamList = {
  Home: { scanResult?: string } | undefined;
  Charge: undefined;
  Help: undefined;
  My: undefined;
};
```

## 🚀 导航方法详解

### 1. navigate() - 普通页面跳转

**用途**: 日常页面跳转，保留导航历史

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// 基础跳转
navigation.navigate('Main');

// 带参数跳转
navigation.navigate('Scan', { 
  onResult: (data) => console.log(data) 
});

// 嵌套导航跳转（Tab内页面）
navigation.navigate('Main', { 
  screen: 'Charge' 
});

// 复杂参数传递
navigation.navigate('Main', {
  screen: 'Home',
  params: { scanResult: 'QR123456' }
});
```

**特点**:
- ✅ 保留导航历史，用户可以返回
- ✅ 适合普通页面跳转
- ✅ 支持参数传递

### 2. reset() - 重置导航栈

**用途**: 登录/登出等状态切换场景

```typescript
// 登录成功后跳转主页面
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});

// 退出登录返回登录页
navigation.reset({
  index: 0,
  routes: [{ name: 'Auth' }],
});

// 重置到特定Tab页面
navigation.reset({
  index: 0,
  routes: [
    {
      name: 'Main',
      params: { screen: 'Home' }
    }
  ],
});

// 多个路由的情况 - index 可以是其他值
navigation.reset({
  index: 1,  // 当前显示第二个页面 (Auth)
  routes: [
    { name: 'Welcome' },    // index: 0
    { name: 'Auth' },       // index: 1 (当前页面)
  ],
});

// 复杂的路由栈重置
navigation.reset({
  index: 2,  // 当前显示第三个页面 (Profile)
  routes: [
    { name: 'Main', params: { screen: 'Home' } },    // index: 0
    { name: 'Settings' },                            // index: 1
    { name: 'Profile', params: { userId: '123' } },  // index: 2 (当前页面)
  ],
});
```

### index 参数详解

**`index`** 表示**当前激活路由**在 `routes` 数组中的索引位置：

| index | 含义 | 路由栈状态 |
|-------|------|------------|
| `0` | 显示第1个路由 | `[●Main]` |
| `1` | 显示第2个路由 | `[Welcome, ●Auth]` |
| `2` | 显示第3个路由 | `[Home, Settings, ●Profile]` |

#### 📝 示例说明

```typescript
// 单页面重置 - index只能是0
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],  // 只有1个路由，index必须是0
});

// 多页面重置 - index可以是0,1,2...
navigation.reset({
  index: 1,  // 显示Auth页面
  routes: [
    { name: 'Welcome' },  // index: 0
    { name: 'Auth' },     // index: 1 ← 当前显示这个
  ],
});

// ❌ 错误示例
navigation.reset({
  index: 5,  // 错误！数组中只有2个元素，最大index是1
  routes: [
    { name: 'Welcome' },
    { name: 'Auth' },
  ],
});
```

**特点**:
- ❌ 清除所有导航历史
- ✅ 用户无法返回到之前页面
- ✅ 适合登录/登出场景

### 3. goBack() - 返回上一页

```typescript
// 简单返回
navigation.goBack();

// 检查是否可以返回
if (navigation.canGoBack()) {
  navigation.goBack();
} else {
  // 处理无法返回的情况
  console.log('已经是第一页了');
}
```

### 4. replace() - 替换当前页面

```typescript
// 替换当前页面（不增加历史记录）
navigation.replace('Main', { screen: 'Home' });
```

**特点**:
- 🔄 替换当前页面，不增加历史
- ✅ 适合错误页面重定向

### 5. push() - 强制推入新页面

```typescript
// 即使已经在该页面，也会推入新实例
navigation.push('Main');
```

## 🎭 页面呈现方式与样式配置

### 1. 页面呈现方式 (Presentation)

React Navigation 提供了多种页面呈现方式，每种方式都有不同的用户体验。

#### Card 呈现 (默认)
```typescript
<Stack.Screen
  name="ProjectList"
  component={ProjectList}
  options={{
    presentation: 'card', // 默认值
    headerShown: true,
    title: '项目列表'
  }}
/>
```

**特点**:
- 🔄 从右侧滑入（iOS）或淡入（Android）
- 📱 与其他页面在同一层级
- ⬅️ 通常显示返回按钮（<）
- ✅ 适合长期浏览、多层级导航

#### Modal 呈现
```typescript
<Stack.Screen
  name="ProjectList"
  component={ProjectList}
  options={{
    presentation: 'modal',
    headerShown: true,
    title: '选择项目'
  }}
/>
```

**特点**:
- ⬆️ 从底部向上滑入
- 🔝 覆盖在当前页面之上
- ❌ 通常显示关闭按钮（×）而不是返回按钮
- 👆 支持下拉关闭手势
- ✅ 适合快速选择、确认操作、临时输入

#### 使用场景对比

| 使用场景 | Card | Modal |
|---------|------|-------|
| 项目列表浏览 | ✅ 适合长期浏览 | ❌ 不太适合 |
| 快速项目选择 | ⚠️ 可以但不够直观 | ✅ 更符合直觉 |
| 多级项目分类 | ✅ 支持深层导航 | ❌ 不适合嵌套 |
| 临时选择操作 | ⚠️ 感觉太重 | ✅ 轻量级体验 |

### 2. 标题栏样式配置

#### 基础样式配置
```typescript
<Stack.Screen
  name="ProjectList"
  component={ProjectList}
  options={{
    presentation: 'card',
    headerShown: true,
    title: '选择项目',
    
    // === 背景和颜色 ===
    headerStyle: {
      backgroundColor: '#6200ea',          // 标题栏背景色
      elevation: 4,                        // Android 阴影
      shadowOpacity: 0.3,                  // iOS 阴影
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    headerTintColor: '#fff',               // 返回按钮和图标颜色
    
    // === 标题样式 ===
    headerTitleStyle: {
      fontWeight: 'bold',                  // 字体粗细
      fontSize: 18,                        // 字体大小
      color: '#fff',                       // 标题文字颜色
      fontFamily: 'System',                // 字体家族
    },
    headerTitleAlign: 'center',            // 标题对齐: 'left' | 'center'
    
    // === 返回按钮自定义 ===
    headerBackTitleVisible: false,         // 隐藏返回按钮文字(iOS)
    headerBackTitle: '返回',               // 自定义返回按钮文字
  }}
/>
```

#### 自定义标题组件
```typescript
<Stack.Screen
  name="ProjectList"
  component={ProjectList}
  options={({ navigation, route }) => ({
    presentation: 'card',
    headerShown: true,
    
    // 自定义标题组件
    headerTitle: () => (
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>选择项目</Text>
        <Text style={styles.headerSubtitle}>请选择一个项目</Text>
      </View>
    ),
    
    // 自定义左侧按钮
    headerLeft: () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>取消</Text>
      </TouchableOpacity>
    ),
    
    // 自定义右侧按钮
    headerRight: () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => console.log('更多操作')}
      >
        <Text style={styles.buttonText}>更多</Text>
      </TouchableOpacity>
    ),
    
    headerStyle: {
      backgroundColor: '#f8f9fa',
      elevation: 2,
    },
  })}
/>
```

#### 主题风格预设

**Material Design 风格**
```typescript
options={{
  presentation: 'card',
  headerShown: true,
  title: '选择项目',
  headerStyle: {
    backgroundColor: '#6200ea',
    elevation: 4,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: '500',
    fontSize: 20,
  },
  headerTitleAlign: 'left', // Material Design 通常左对齐
}}
```

**iOS 风格**
```typescript
options={{
  presentation: 'card',
  headerShown: true,
  title: '选择项目',
  headerStyle: {
    backgroundColor: '#f8f9fa',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  headerTintColor: '#007AFF',
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
    color: '#000',
  },
  headerTitleAlign: 'center', // iOS 通常居中对齐
}}
```

#### 渐变背景标题栏
```typescript
import LinearGradient from 'react-native-linear-gradient';

options={{
  presentation: 'card',
  headerShown: true,
  headerTitle: () => (
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
      选择项目
    </Text>
  ),
  headerBackground: () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    />
  ),
  headerTintColor: '#fff',
}}
```

#### 样式类示例
```typescript
const styles = StyleSheet.create({
  customHeader: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
```

### 3. 添加新页面到导航系统

要在现有项目中添加新页面，需要执行以下步骤：

#### 步骤1：更新类型定义
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList; params?: any } | undefined;
  Scan: { onResult?: (data: string) => void; onCancel?: () => void };
  ProjectList: undefined; // 添加新页面类型
};
```

#### 步骤2：在导航器中注册
```typescript
// src/navigation/AppNavigator.tsx
import ProjectList from '../screens/projectList'; // 导入页面组件

<Stack.Navigator
  initialRouteName={initialRouteName}
  screenOptions={{ headerShown: false }}
>
  <Stack.Screen name="Auth" component={AuthNavigator} />
  <Stack.Screen name="Main" component={MainTabNavigator} />
  <Stack.Screen
    name="ProjectList"
    component={ProjectList}
    options={{
      presentation: 'modal',  // 或 'card'
      headerShown: true,
      title: '选择项目',
      headerStyle: {
        backgroundColor: '#6200ea',
      },
      headerTintColor: '#fff',
    }}
  />
  <Stack.Screen name="Scan" component={ScanScreen} />
</Stack.Navigator>
```

#### 步骤3：使用导航
```typescript
// 在任何组件中使用
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../services/navigationService';

// 方法1：使用 hook
const navigation = useNavigation();
navigation.navigate('ProjectList');

// 方法2：使用全局服务
navigate('ProjectList');
```

## 🛠 项目实际应用

### 登录流程
```typescript
// src/screens/LoginScreen.tsx
const handleLogin = async () => {
  // 验证登录
  const token = await login(credentials);
  setToken(token);
  
  // 重置到主页面（清除登录历史）
  navigation.reset({
    index: 0,
    routes: [{ name: 'Main' }],
  });
};
```

### 退出登录
```typescript
// src/screens/MyScreen.tsx
const handleLogout = () => {
  clearToken();
  
  // 重置到登录页面
  navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
};
```

### HTTP拦截器中的导航
```typescript
// src/utils/interceptors.ts
case 401:
  clearToken();
  Alert.alert('提示', '登录已过期，请重新登录', [
    {
      text: '确定',
      onPress: () => {
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }, 100);
      },
    },
  ]);
  break;
```

### 扫码功能
```typescript
// src/navigation/MainTabNavigator.tsx
const handleScanPress = () => {
  navigation.navigate('Scan', {
    onResult: (data: string) => {
      // 处理扫码结果
      setScanResult(data);
    },
    onCancel: () => {
      console.log('扫码取消');
    }
  });
};
```

## 🎯 全局导航服务

### 服务文件
```typescript
// src/services/navigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// 跳转到首页
export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Home' });
  }
}

// 跳转到充值页面
export function navigateToCharge() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Charge' });
  }
}

// 打开扫码页面
export function openScanScreen(onResult?: (data: string) => void) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Scan', { onResult });
  }
}
```

### 在组件外使用
```typescript
import { navigateToHome, navigateToCharge } from '../services/navigationService';

// 在任何地方使用
export const someUtilFunction = () => {
  // 业务逻辑
  if (success) {
    navigateToHome();
  }
};
```

## 📱 参数传递

### 1. 基础参数传递
```typescript
// 发送参数
navigation.navigate('Charge', { 
  amount: 100,
  userId: '12345'
});

// 接收参数
const ChargeScreen = ({ route }) => {
  const { amount, userId } = route.params;
  // 使用参数
};
```

### 2. TypeScript 类型安全
```typescript
// 定义路由参数类型
type ChargeScreenProps = {
  route: RouteProp<RootStackParamList, 'Charge'>;
  navigation: StackNavigationProp<RootStackParamList, 'Charge'>;
};

// 组件中使用
const ChargeScreen: React.FC<ChargeScreenProps> = ({ route, navigation }) => {
  const params = route.params; // 类型安全的参数
};
```

### 3. 嵌套导航参数
```typescript
// 跳转到Tab内的特定页面并传参
navigation.navigate('Main', {
  screen: 'Home',
  params: { 
    scanResult: 'QR123456',
    timestamp: Date.now()
  }
});
```

## 🔒 返回键处理

### 全局返回键逻辑
```typescript
// src/navigation/AppNavigator.tsx
useEffect(() => {
  const backAction = () => {
    // 如果正在扫码，取消扫码
    if (isScanning) {
      stopScan();
      return true;
    }

    // 双击退出应用
    if (lastBackPressed.current && 
        lastBackPressed.current + 2000 >= Date.now()) {
      BackHandler.exitApp();
      return true;
    }

    lastBackPressed.current = Date.now();
    ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    backAction
  );

  return () => backHandler.remove();
}, [isScanning]);
```

### Tab页面返回键处理
```typescript
// src/navigation/AppNavigator.tsx - useMainScreenBackHandler
export const useMainScreenBackHandler = () => {
  const navigation = useNavigation();
  
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        
        // 如果不在首页，先跳转到首页
        if (currentRoute?.name === 'Main' && currentRoute.state) {
          const tabState = currentRoute.state;
          const currentTab = tabState.routes[tabState.index];
          
          if (currentTab?.name !== 'Home') {
            navigation.navigate('Main', { screen: 'Home' });
            return true;
          }
        }
        
        // 如果已经在首页，执行双击退出逻辑
        // ... 双击退出逻辑
      };
      
      // ... 注册监听器
    }, [navigation])
  );
};
```

## 🎨 自定义组件

### 自定义TabBar
```typescript
// src/navigation/CustomTabNavigator.tsx
const CustomTabNavigator: React.FC<BottomTabBarProps & { onScanPress: () => void }> = ({ 
  state, 
  descriptors, 
  navigation,
  onScanPress 
}) => {
  return (
    <View style={styles.tabbarBox}>
      {/* 左侧按钮 */}
      <View style={styles.tabbarBtnFl}>
        {tabConfig.slice(0, 2).map((tab, index) => {
          const route = state.routes[index];
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={tab.key} onPress={onPress}>
              {/* Tab内容 */}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 中间扫码按钮 */}
      <TouchableOpacity onPress={onScanPress}>
        {/* 扫码按钮内容 */}
      </TouchableOpacity>
      
      {/* 右侧按钮 */}
      {/* ... */}
    </View>
  );
};
```

## 🚨 最佳实践

### 1. 登录/登出场景
```typescript
// ✅ 正确：使用 reset() 清除导航历史
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});

// ❌ 错误：使用 navigate() 保留登录页面历史
navigation.navigate('Main');
```

### 2. 普通页面跳转
```typescript
// ✅ 正确：使用 navigate() 保留导航历史
navigation.navigate('Charge');

// ❌ 错误：滥用 reset() 清除历史
navigation.reset({
  index: 0,
  routes: [{ name: 'Charge' }],
});
```

### 3. 参数传递
```typescript
// ✅ 正确：明确的参数类型
navigation.navigate('Home', { 
  scanResult: 'QR123456',
  userId: user.id 
});

// ❌ 错误：未定义类型的复杂对象
navigation.navigate('Home', { 
  data: someComplexObject 
});
```

### 4. 全局导航
```typescript
// ✅ 正确：检查导航准备状态
export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Home' });
  }
}

// ❌ 错误：直接调用可能导致崩溃
export function navigateToHome() {
  navigationRef.navigate('Main', { screen: 'Home' });
}
```

### 5. 返回键处理
```typescript
// ✅ 正确：提供用户友好的退出体验
const backAction = () => {
  if (lastBackPressed.current + 2000 >= Date.now()) {
    BackHandler.exitApp();
    return true;
  }
  
  lastBackPressed.current = Date.now();
  ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
  return true;
};

// ❌ 错误：直接退出应用
const backAction = () => {
  BackHandler.exitApp();
  return true;
};
```

## 🔍 常见问题

### Q1: 如何在非组件文件中使用导航？
**A**: 使用全局导航服务 `navigationRef`

```typescript
// services/navigationService.ts
if (navigationRef.isReady()) {
  navigationRef.navigate('Home');
}
```

### Q2: 如何传递复杂参数？
**A**: 建议传递简单数据，复杂数据用全局状态管理

```typescript
// ✅ 推荐
navigation.navigate('Detail', { itemId: '123' });

// 在目标页面中获取详细数据
const DetailScreen = ({ route }) => {
  const { itemId } = route.params;
  const item = useSelector(state => state.items[itemId]);
};
```

### Q3: 如何处理深层链接？
**A**: 配置 linking 选项

```typescript
const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Charge: 'charge/:amount',
        },
      },
    },
  },
};

// 在 NavigationContainer 中使用
<NavigationContainer ref={navigationRef} linking={linking}>
  <AppNavigator />
</NavigationContainer>
```

### Q4: 如何防止重复导航？
**A**: 检查当前路由状态

```typescript
const currentRoute = navigationRef.getCurrentRoute();
if (currentRoute?.name !== 'Home') {
  navigationRef.navigate('Home');
}
```

## 📚 相关文档

- [React Navigation 官方文档](https://reactnavigation.org/)
- [TypeScript 支持](https://reactnavigation.org/docs/typescript/)
- [深层链接](https://reactnavigation.org/docs/deep-linking/)
- [自定义导航器](https://reactnavigation.org/docs/custom-navigators/)

---

**最后更新**: 2025年1月17日
**项目**: AwesomeProject React Navigation 导航系统