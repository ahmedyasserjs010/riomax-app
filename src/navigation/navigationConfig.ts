import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

// Centralized navigation configuration constants
export const LINKING_PREFIXES = ['riomax://', 'https://riomax.app', 'https://*.riomax.app'];

// Deep linking configuration
export const linkingConfig: any = {
  prefixes: LINKING_PREFIXES,
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: {
            screens: {
              HomeMain: '',
              Categories: 'categories',
              CategoryProducts: 'categories/:categoryId',
              ProductsList: 'home-search',
            },
          },
          Products: {
            screens: {
              ProductsListMain: 'products',
            },
          },
          Profile: {
            screens: {
              ProfileMain: 'profile',
              Invoices: 'orders',
              UserProfile: 'user-info',
              About: 'about',
              Contact: 'contact',
              QA: 'faq',
              ChangePassword: 'change-password',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ConfirmEmail: 'confirm-email/:email',
        },
      },
      ProductDetail: 'product/:productId',
      Checkout: 'checkout',
      Cart: 'cart',
      Wishlist: 'wishlist',
      DynamicPage: 'page/:type',
    },
  },
};

// Transition Presets for Native Stack
export const screenTransitions = {
  // Push animations (typical for details, categories, sub-pages)
  push: {
    animation: 'slide_from_right',
    gestureEnabled: true,
    freezeOnBlur: true,
  } as NativeStackNavigationOptions,

  // Fade animations (good for simple/clean changes, or tab transitions)
  fade: {
    animation: 'fade',
    gestureEnabled: true,
    freezeOnBlur: true,
  } as NativeStackNavigationOptions,

  // Modal animations (entry points like Auth stacks or custom modal screens)
  modal: {
    animation: 'fade_from_bottom',
    gestureEnabled: true,
    freezeOnBlur: true,
  } as NativeStackNavigationOptions,

  // Stack level defaults for general screens
  defaultStackOptions: (colors: any): NativeStackNavigationOptions => ({
    headerShown: false,
    contentStyle: { backgroundColor: colors.background },
    freezeOnBlur: true,
    animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'slide_from_right',
  }),
};
