import React from 'react';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { DynamicPageScreen } from '../screens/DynamicPageScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryProductsScreen } from '../screens/CategoryProductsScreen';
import { ProductsListScreen } from '../screens/ProductsListScreen';
import { CartScreen } from '../screens/CartScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { InvoicesScreen } from '../screens/InvoicesScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { QAScreen } from '../screens/QAScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

interface SharedStackScreensProps {
  Stack: any;
}

export const SharedStackScreens: React.FC<SharedStackScreensProps> = ({ Stack }) => {
  return (
    <>
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ title: 'تفاصيل المنتج' }} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ title: 'إتمام الشراء' }} 
      />
      <Stack.Screen 
        name="DynamicPage" 
        component={DynamicPageScreen} 
        options={({ route }: any) => ({ title: route.params?.title || 'معلومات' })} 
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ title: 'الأقسام' }} 
      />
      <Stack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen} 
        options={({ route }: any) => ({ title: route.params?.name || 'المنتجات' })} 
      />
      <Stack.Screen 
        name="ProductsList" 
        component={ProductsListScreen} 
        options={{ title: 'البحث والمنتجات' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'سلة المشتريات' }} 
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ title: 'المفضلة' }} 
      />
      <Stack.Screen 
        name="Invoices" 
        component={InvoicesScreen} 
        options={{ title: 'طلباتي' }} 
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen} 
        options={{ title: 'بيانات صاحب الحساب' }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'عن ريوماكس' }} 
      />
      <Stack.Screen 
        name="Contact" 
        component={ContactScreen} 
        options={{ title: 'تواصل معنا' }} 
      />
      <Stack.Screen 
        name="QA" 
        component={QAScreen} 
        options={{ title: 'الأسئلة الشائعة' }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'تغيير كلمة المرور' }} 
      />
    </>
  );
};
