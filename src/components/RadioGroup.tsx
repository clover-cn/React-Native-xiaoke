import React, { createContext, useContext, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

interface RadioGroupContextValue {
  selectedValue?: string;
  onSelectionChange?: (value: string) => void;
  name?: string;
  color?: string;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

export const useRadioGroup = () => useContext(RadioGroupContext);

interface RadioGroupProps {
  children: ReactNode;
  selectedValue?: string;
  onSelectionChange?: (value: string) => void;
  name?: string;
  color?: string;
  style?: ViewStyle;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  selectedValue,
  onSelectionChange,
  name,
  color = '#ff600a',
  style,
}) => {
  const contextValue: RadioGroupContextValue = {
    selectedValue,
    onSelectionChange,
    name,
    color,
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View style={style}>{children}</View>
    </RadioGroupContext.Provider>
  );
};

export default RadioGroup;