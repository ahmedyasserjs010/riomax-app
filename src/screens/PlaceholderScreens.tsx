import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PlaceholderScreen = ({ name }: { name: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>{name} Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});

export const HomeScreen = () => <PlaceholderScreen name="Home" />;
export const CategoriesScreen = () => <PlaceholderScreen name="Categories" />;
export const CartScreen = () => <PlaceholderScreen name="Cart" />;
export const ProfileScreen = () => <PlaceholderScreen name="Profile" />;
export const LoginScreen = () => <PlaceholderScreen name="Login" />;
export const RegisterScreen = () => <PlaceholderScreen name="Register" />;
export const ProductDetailScreen = () => <PlaceholderScreen name="Product Detail" />;
export const CategoryProductsScreen = () => <PlaceholderScreen name="Category Products" />;
export const CheckoutScreen = () => <PlaceholderScreen name="Checkout" />;
export const WishlistScreen = () => <PlaceholderScreen name="Wishlist" />;
export const InvoicesScreen = () => <PlaceholderScreen name="Invoices" />;
export const AboutScreen = () => <PlaceholderScreen name="About" />;
