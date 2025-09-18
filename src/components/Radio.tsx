import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRadioGroup } from './RadioGroup';

interface RadioProps {
  value: string;
  checked?: boolean;
  color?: string;
  size?: number;
  onPress?: (value: string) => void;
  onChange?: (checked: boolean, value: string) => void; // 新增：状态变化回调
  style?: ViewStyle;
  disabled?: boolean;
}

const Radio: React.FC<RadioProps> = ({
  value,
  checked,
  color,
  size = 20,
  onPress,
  onChange,
  style,
  disabled = false,
}) => {
  const radioGroup = useRadioGroup();
  const [internalChecked, setInternalChecked] = useState(false);
  
  // 判断选中状态的优先级：
  // 1. 如果有RadioGroup，使用RadioGroup的selectedValue
  // 2. 如果传入了checked属性，使用checked
  // 3. 否则使用内部状态
  const isChecked = radioGroup.selectedValue !== undefined
    ? radioGroup.selectedValue === value
    : checked !== undefined
    ? checked
    : internalChecked;
    
  const radioColor = color || radioGroup.color || '#ff600a';
  
  const handlePress = () => {
    if (!disabled) {
      // 优先使用RadioGroup的回调
      if (radioGroup.onSelectionChange) {
        radioGroup.onSelectionChange(value);
      } else if (onPress) {
        onPress(value);
      } else {
        // 如果没有外部回调，切换内部状态
        const newChecked = !internalChecked;
        setInternalChecked(newChecked);
        
        // 调用状态变化回调
        if (onChange) {
          onChange(newChecked, value);
        }
      }
    }
  };

  const radioSize = size;
  const iconSize = Math.floor(size * 0.8);

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={handlePress}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <View
        style={[
          styles.radio,
          {
            width: radioSize,
            height: radioSize,
            borderRadius: radioSize / 2,
            borderColor: isChecked ? radioColor : '#D9DEE5',
            backgroundColor: isChecked ? radioColor : 'transparent',
          },
        ]}
      >
        {isChecked && (
          <Image
            source={require('../../assets/images/icon_correct.png')}
            style={[
              styles.checkIcon,
              {
                width: iconSize,
                height: iconSize,
              },
            ]}
            resizeMode="contain"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    tintColor: '#FFFFFF',
  },
});

export default Radio;