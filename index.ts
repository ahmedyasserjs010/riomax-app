import { enableScreens } from 'react-native-screens';

// Must be called before any UI or React rendering to initialize native screen containers safely
enableScreens(true);

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

