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
import { getProductPrice, hasProductDiscount, getProductImage } from '../utils/productHelpers';
import { RefreshControl } from 'react-native';

const placeholderImage = require('../../assets/icon.png');
const { width } = Dimensions.get('window');

export const CategoryProductsScreen = ({ route, navigation }: any) => {
  const { categoryId, name } = route.params;
  const { colors } = useTheme();

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Queries — use 'categoryId' to match backend's expected query parameter name with pagination
  const { data: productsData, isLoading, isFetching, refetch } = useProducts({ categoryId, page, limit: 12 });
  const totalPages = productsData?.pagination?.totalPages || 1;

  useEffect(() => {
    if (productsData?.products) {
      if (page === 1) {
        setProducts(productsData.products);
      } else {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id || p.id));
          const newProds = productsData.products.filter(p => !existingIds.has(p._id || p.id));
          return [...prev, ...newProds];
        });
      }
    }
  }, [productsData, page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isFetching && page < totalPages && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  if (page === 1 && isLoading) {
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>لا توجد منتجات في هذا القسم حالياً.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const effectivePrice = getProductPrice(item);
          const hasDiscount = hasProductDiscount(item);
          const imageUrl = getProductImage(item);

          return (
            <TouchableOpacity 
              style={[styles.productCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id || item.id })}
            >
              <Image 
                source={imageUrl ? { uri: imageUrl } : placeholderImage} 
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
