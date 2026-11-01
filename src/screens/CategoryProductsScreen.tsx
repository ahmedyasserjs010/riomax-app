import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useProducts } from '../hooks/useApi';
import { IProduct } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Breadcrumbs } from '../components/Breadcrumbs';


const { width } = Dimensions.get('window');

export const CategoryProductsScreen = ({ route, navigation }: any) => {
  const { categoryId, name } = route.params;
  const { colors } = useTheme();

  // Queries — use 'categoryId' to match backend's expected query parameter name
  const { data: productsData, isLoading: loading } = useProducts({ categoryId, limit: 100 });
  const products = productsData?.products || [];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Breadcrumbs items={[{ label: name || 'المنتجات' }]} />

      <FlatList
        data={products}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>لا توجد منتجات في هذا القسم حالياً.</Text>
          </View>
        }
        renderItem={({ item }) => {
          // Show effective price: priceAfterDiscount if > 0, otherwise base price
          const effectivePrice = item.priceAfterDiscount > 0 ? item.priceAfterDiscount : item.price;
          const hasDiscount = Number(item.discountAmountProduct) > 0 && item.priceAfterDiscount > 0;

          return (
            <TouchableOpacity 
              style={[styles.productCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id || item.id })}
            >
              <Image 
                source={{ uri: item.images?.[0]?.secure_url }} 
                style={styles.productImage} 
                contentFit="cover" 
              />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{effectivePrice} ج.م</Text>
                  {hasDiscount ? (
                    <Text style={styles.oldPrice}>{item.price} ج.م</Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 8 },
  productCard: { 
    width: (width - 32) / 2, 
    margin: 4, 
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: { width: '100%', height: 160 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '500', height: 40, marginBottom: 4, textAlign: 'left' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  price: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
  oldPrice: { 
    fontSize: 11, 
    color: '#94a3b8', 
    textDecorationLine: 'line-through' 
  },
  empty: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 20, textAlign: 'center', fontSize: 16 },
});
