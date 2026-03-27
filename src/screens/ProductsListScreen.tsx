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
import { ProductService, CategoryService } from '../services/HomeServices';
import { IProduct, ICategory, ISubCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../components/ProductCard';
import { FilterBox } from '../components/FilterBox';

export const ProductsListScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  
  // Filter State
  const initialCategory = route.params?.selectedCategoryId || null;
  const initialSearch = route.params?.initialSearch || '';

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allCategoriesData, setAllCategoriesData] = useState<any[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Fetch Category Tree
  const fetchLayoutData = async () => {
    try {
      const catRes = await CategoryService.getCategoriesWithSub();
      const cats = catRes.data || [];
      setAllCategoriesData(cats);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching layout data:', error);
    }
  };

  // Fetch Products
  const fetchProducts = async (currentPage = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setFetchingMore(true);
      else setLoading(true);

      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery.trim() !== '') params.keyword = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSubCategory) params.subCategoryId = selectedSubCategory;

      const prodRes = await ProductService.getProducts(params);
      const newProducts = prodRes.data?.products || [];
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      setTotalProducts(prodRes.data?.pagination?.totalCount || 0);
      setTotalPages(prodRes.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLayoutData();
    fetchProducts(1, false);
  }, []);

  // Sync SubCategories
  useEffect(() => {
    if (selectedCategory) {
      const cat = allCategoriesData.find(c => c._id === selectedCategory || c.id === selectedCategory);
      setSubCategories(cat?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, allCategoriesData]);

  // Re-fetch when filters change
  useEffect(() => {
    if (loading && products.length === 0) return;
    setPage(1);
    fetchProducts(1, false);
  }, [selectedCategory, selectedSubCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchLayoutData();
    fetchProducts(1, false);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (!fetchingMore && page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
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
