import { NavigatorScreenParams } from '@react-navigation/native';

export type SharedStackParamList = {
  ProductDetail: { productId: string };
  Checkout: undefined;
  DynamicPage: { type: 'terms' | 'privacy' | 'refund'; title: string };
  Categories: undefined;
  CategoryProducts: { categoryId: string; name: string };
  ProductsList: { selectedCategoryId?: string; keyword?: string } | undefined;
  Cart: undefined;
  Wishlist: undefined;
  Invoices: undefined;
  UserProfile: undefined;
  About: undefined;
  Contact: undefined;
  QA: undefined;
  ChangePassword: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
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
} & SharedStackParamList;

export type ProductsStackParamList = {
  ProductsListMain: { selectedCategoryId?: string; keyword?: string } | undefined;
} & SharedStackParamList;

export type ProfileStackParamList = {
  ProfileMain: undefined;
} & SharedStackParamList;

// Global type declaration for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
export type NavigationPropType<T extends keyof RootStackParamList> = any;

