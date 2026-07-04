import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useCategoriesTree, useProducts } from '../hooks/useApi';
import { IProduct, ICategory, ISubCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../components/ProductCard';
import { FilterBox } from '../components/FilterBox';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const ProductsListScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  
  // Filter State
  const initialCategory = route.params?.selectedCategoryId || null;
  const initialSearch = route.params?.initialSearch || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: categoriesData, refetch: refetchCategories, isLoading: categoriesLoading } = useCategoriesTree();

  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10 };
    if (searchQuery.trim() !== '') params.keyword = searchQuery;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedSubCategory) params.subCategoryId = selectedSubCategory;
    return params;
  }, [page, searchQuery, selectedCategory, selectedSubCategory]);

  const { data: productsData, isLoading: productsLoading, isFetching: productsFetching, refetch: refetchProducts } = useProducts(queryParams);

  const categories = categoriesData || [];
  const totalProducts = productsData?.pagination?.totalCount || 0;
  const totalPages = productsData?.pagination?.totalPages || 1;

  const loading = categoriesLoading || (page === 1 && productsLoading);
  const fetchingMore = page > 1 && productsFetching;

  // Sync products when page or query data changes
  useEffect(() => {
    if (productsData) {
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

  // Sync SubCategories when Category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const cat = categories.find(c => c._id === selectedCategory || c.id === selectedCategory);
      setSubCategories(cat?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, categories]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedSubCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([
      refetchCategories(),
      refetchProducts(),
    ]);
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    refetchProducts();
  };

  const handleLoadMore = () => {
    if (!productsFetching && page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={{ height: 10 }} />
            <FilterBox 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmitSearch={handleSearchSubmit}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              subCategories={subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelectSubCategory={setSelectedSubCategory}
              totalProductsCount={totalProducts}
            />
            <View style={{ height: 10 }} />
          </>
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id || item.id })} 
            isInCart={isInCart(item._id || item.id)}
            isWishlisted={isInWishlist(item._id || item.id)}
            onAddToCart={async () => {
                try {
                    await addToCart(item._id || item.id);
                    showToast('تمت إضافة المنتج إلى السلة', 'success');
                } catch (err: any) {
                    showToast(err.message || 'فشل في الإضافة للسلة', 'error');
                }
            }}
            onToggleWishlist={async () => {
                try {
                    await toggleWishlist(item._id || item.id);
                    const isFav = isInWishlist(item._id || item.id);
                    showToast(isFav ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة', 'info');
                } catch (err: any) {
                    showToast('فشل في تعديل المفضلة', 'error');
                }
            }}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          fetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : <View style={{ height: 40 }} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                لم نجد أي منتجات تطابق بحثك.
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1, 
    alignItems: 'center', 
    marginTop: 80, 
    paddingHorizontal: 40
  },
  emptyText: { 
    marginTop: 20, 
    textAlign: 'center', 
    fontSize: 16 
  },
});
