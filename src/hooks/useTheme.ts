import { useColorScheme } from 'react-native';
import { Colors, Theme } from '../theme/colors';

export const useTheme = (): { theme: Theme; isDarkMode: boolean } => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  return { theme, isDarkMode };
};
