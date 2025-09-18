# Radio 组件使用文档

## 概述

Radio组件是一个类似微信小程序的通用单选按钮组件系统，包含两个核心组件：
- `RadioGroup`: 单选按钮组容器，管理一组单选按钮的状态
- `Radio`: 单选按钮，支持单独使用或配合RadioGroup使用

## 特性

- ✅ 使用 `icon_correct.png` 作为选中图标
- ✅ 支持自定义背景色和边框色
- ✅ 完全通用，不写死UI，方便复用
- ✅ 类似微信小程序的API设计
- ✅ 支持三种使用模式：单独使用、受控模式、RadioGroup模式
- ✅ TypeScript 支持

## 导入方式

```tsx
import Radio from '../components/Radio';
import RadioGroup from '../components/RadioGroup';
```

## Radio 组件 API

### Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| value | string | - | ✅ | 单选按钮的值，用于标识 |
| checked | boolean | undefined | ❌ | 是否选中（受控模式） |
| color | string | '#ff600a' | ❌ | 选中时的颜色 |
| size | number | 20 | ❌ | 单选按钮大小（像素） |
| onPress | (value: string) => void | - | ❌ | 点击回调 |
| onChange | (checked: boolean, value: string) => void | - | ❌ | 状态变化回调 |
| style | ViewStyle | - | ❌ | 自定义样式 |
| disabled | boolean | false | ❌ | 是否禁用 |

## RadioGroup 组件 API

### Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| selectedValue | string | - | ❌ | 当前选中的值 |
| onSelectionChange | (value: string) => void | - | ❌ | 选择变化回调 |
| name | string | - | ❌ | 组名称（用于标识） |
| color | string | '#ff600a' | ❌ | 默认颜色，会传递给子Radio |
| style | ViewStyle | - | ❌ | 容器样式 |

## 使用示例

### 1. 单独使用（自动管理状态）

最简单的用法，组件自动管理选中状态：

```tsx
<Radio value="agree" />
```

### 2. 监听状态变化

```tsx
<Radio 
  value="agree" 
  onChange={(checked, value) => {
    console.log(`选项 ${value} 状态: ${checked ? '选中' : '未选中'}`);
  }}
/>
```

### 3. 受控模式

完全控制组件状态：

```tsx
const [agree, setAgree] = useState(false);

<Radio 
  value="agree" 
  checked={agree} 
  onPress={() => setAgree(!agree)}
  onChange={(checked, value) => {
    console.log('状态变化:', checked, value);
  }}
/>
```

### 4. 自定义样式

```tsx
<Radio 
  value="option1" 
  color="#FF6B35"
  size={24}
  style={{ marginRight: 10 }}
/>
```

### 5. RadioGroup 基础用法

类似微信小程序的用法，管理一组单选按钮：

```tsx
const [selectedProject, setSelectedProject] = useState('project1');

<RadioGroup
  selectedValue={selectedProject}
  onSelectionChange={setSelectedProject}
  color="#ff600a"
>
  {projectList.map((project) => (
    <View key={project.id} style={styles.listItem}>
      <Text>{project.name}</Text>
      <Radio value={project.id} />
    </View>
  ))}
</RadioGroup>
```

### 6. 完整的项目列表示例

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RadioGroup from '../components/RadioGroup';
import Radio from '../components/Radio';

const ProjectList = () => {
  const [selectedProject, setSelectedProject] = useState('');
  
  const projects = [
    { id: '1', name: '项目A' },
    { id: '2', name: '项目B' },
    { id: '3', name: '项目C' },
  ];

  const handleSelectionChange = (value: string) => {
    setSelectedProject(value);
    console.log('选中项目:', value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择项目</Text>
      
      <RadioGroup
        selectedValue={selectedProject}
        onSelectionChange={handleSelectionChange}
        color="#ff600a"
      >
        {projects.map((project) => (
          <View key={project.id} style={styles.listItem}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Radio value={project.id} />
          </View>
        ))}
      </RadioGroup>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  projectName: {
    fontSize: 16,
    color: '#333',
  },
});
```

### 7. 在登录页面使用（替换原有checkbox）

```tsx
// 原来的代码
<TouchableOpacity onPress={() => setAgree(!agree)}>
  <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
    {agree && <Text style={styles.checkboxIcon}>✓</Text>}
  </View>
</TouchableOpacity>

// 替换为Radio组件
<Radio 
  value="agree" 
  checked={agree} 
  color="#FF6B35"  // 保持原来的颜色
  size={18}
  onPress={() => setAgree(!agree)}
  onChange={(checked) => {
    console.log('用户协议:', checked ? '已同意' : '未同意');
  }}
/>
```

## 高级用法

### 1. 动态禁用某些选项

```tsx
<RadioGroup
  selectedValue={selectedValue}
  onSelectionChange={setSelectedValue}
>
  {options.map((option) => (
    <View key={option.id} style={styles.listItem}>
      <Text style={[
        styles.optionText, 
        option.disabled && styles.disabledText
      ]}>
        {option.name}
      </Text>
      <Radio 
        value={option.id} 
        disabled={option.disabled}
      />
    </View>
  ))}
</RadioGroup>
```

### 2. 自定义选中图标大小

```tsx
<Radio 
  value="large" 
  size={32}  // 更大的单选按钮
  color="#00c853"
/>
```

### 3. 混合使用（部分在RadioGroup中，部分单独使用）

```tsx
<View>
  {/* RadioGroup管理的选项 */}
  <RadioGroup selectedValue={mainOption} onSelectionChange={setMainOption}>
    <Radio value="option1" />
    <Radio value="option2" />
  </RadioGroup>
  
  {/* 单独的选项 */}
  <Radio 
    value="independent" 
    checked={independentChecked}
    onPress={() => setIndependentChecked(!independentChecked)}
  />
</View>
```

## 注意事项

1. **value属性是必须的**：每个Radio组件都必须提供唯一的value值
2. **状态管理优先级**：RadioGroup > checked属性 > 内部状态
3. **回调优先级**：RadioGroup的onSelectionChange > onPress > 内部状态切换
4. **图标资源**：确保项目中存在`assets/images/icon_correct.png`文件
5. **TypeScript支持**：所有组件都提供完整的TypeScript类型定义

## 常见问题

### Q: Radio单独使用时点击没反应？
A: 确保传入了`onChange`或`onPress`回调，或者让组件自己管理状态（不传checked属性）

### Q: RadioGroup中的Radio怎么自定义样式？
A: 每个Radio都可以单独设置style、color、size等属性

### Q: 怎么获取当前选中的项目详情？
A: 在onSelectionChange回调中根据value查找对应的数据项

### Q: 可以设置默认选中项吗？
A: 可以通过RadioGroup的selectedValue属性或Radio的checked属性设置

## 更新日志

- v1.0.0: 初始版本，支持基本的单选功能
- v1.1.0: 新增onChange回调，支持单独使用时的状态监听
- v1.2.0: 优化状态管理逻辑，提供更好的TypeScript支持