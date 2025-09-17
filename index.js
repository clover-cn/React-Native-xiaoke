/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// 启用react-native-screens
enableScreens();

AppRegistry.registerComponent(appName, () => App);
