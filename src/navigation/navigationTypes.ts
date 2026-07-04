import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ProductDetail: { productId: string };
  Checkout: undefined;
  Cart: undefined;
  Wishlist: undefined;
  DynamicPage: { type: 'terms' | 'privacy' | 'refund'; title: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ConfirmEmail: { email: string };
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Products: NavigatorScreenParams<ProductsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Categories: undefined;
  CategoryProducts: { categoryId: string; name: string };
  ProductsList: { selectedCategoryId?: string; keyword?: string };
};

export type ProductsStackParamList = {
  ProductsListMain: { selectedCategoryId?: string; keyword?: string } | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Invoices: undefined;
  UserProfile: undefined;
  About: undefined;
  Contact: undefined;
  QA: undefined;
  ChangePassword: undefined;
};

// Global type declaration for useNavigation hook (so useNavigation<any>() isn't needed)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
export type NavigationPropType<T extends keyof RootStackParamList> = any; // Fallback if direct typing is not needed but allows flexibility
