import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Animated,
  ScrollView
} from 'react-native';

import { Image } from 'expo-image';
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { SliderService, CategoryService, ProductService } from '../services/HomeServices';
import { ISlider, ICategory, IProduct, ISubCategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../components/ProductCard';
import { FilterBox } from '../components/FilterBox';
import { HeroSlider } from '../components/HeroSlider';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InfiniteCategoryScroll = ({ data, onPress, colors }: { data: any[], onPress: (id: string) => void, colors: any }) => {
  const ITEM_WIDTH = 80;
  const GAP = 10;
  const ITEM_SIZE = ITEM_WIDTH + GAP;
  const setWidth = data.length * ITEM_SIZE;
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const isInteracting = useRef(false);
  const currentOffset = useRef(setWidth);
  const scrollTimer = useRef<any>(null);

  // Triple the data for seamless looping
  const tripledData = useMemo(() => {
    if (data.length === 0) return [];
    return [...data, ...data, ...data];
  }, [data]);

  // Handle Initial Scroll & Auto-Scroll
  useEffect(() => {
    if (data.length === 0) return;

    // Initial Scroll to middle set
    setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: setWidth, animated: false });
        currentOffset.current = setWidth;
    }, 100);

    // Auto-scroll logic (slow creep)
    const interval = setInterval(() => {
      if (!isInteracting.current && flatListRef.current) {
        currentOffset.current += 1;
        flatListRef.current.scrollToOffset({ offset: currentOffset.current, animated: false });
        
        if (currentOffset.current >= setWidth * 2) {
          currentOffset.current = setWidth;
          flatListRef.current.scrollToOffset({ offset: currentOffset.current, animated: false });
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [data, setWidth]);

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    currentOffset.current = offset;
    
    if (offset >= setWidth * 2) {
      const newOffset = offset - setWidth;
      currentOffset.current = newOffset;
      flatListRef.current?.scrollToOffset({ offset: newOffset, animated: false });
    } else if (offset <= setWidth / 2) {
      const newOffset = offset + setWidth;
      currentOffset.current = newOffset;
      flatListRef.current?.scrollToOffset({ offset: newOffset, animated: false });
    }
  };

  if (data.length === 0) return null;

  const progress = scrollX.interpolate({
    inputRange: [setWidth, setWidth * 2],
    outputRange: [0, (SCREEN_WIDTH - 100)],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.infiniteContainer}>
      <FlatList
        ref={flatListRef}
        data={tripledData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `cat-${index}`}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
            isInteracting.current = true;
            if (scrollTimer.current) clearTimeout(scrollTimer.current);
        }}
        onScrollEndDrag={() => {
            scrollTimer.current = setTimeout(() => {
                isInteracting.current = false;
            }, 3000); // Resume auto-scroll after 3 seconds of inactivity
        }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.categoryCard, { width: ITEM_WIDTH, marginRight: GAP }]} 
            onPress={() => onPress(item._id)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{ uri: item.image?.secure_url }} style={styles.categoryImage} contentFit="contain" />
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={{ paddingLeft: 16 }}
      />
      
      <View style={[styles.indicatorWrapper, { backgroundColor: colors.border }]}>
        <Animated.View 
            style={[
                styles.indicator, 
                { 
                    backgroundColor: Colors.primary,
                    width: 40,
                    transform: [{ translateX: progress }]
                }
            ]} 
        />
      </View>
    </View>
  );
};


export const HomeScreen = ({ navigation }: any) => {

  const { colors } = useTheme();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  
  // Data State
  const [sliders, setSliders] = useState<ISlider[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allCategoriesData, setAllCategoriesData] = useState<any[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // 1. Fetch Initial Layout Data (Sliders & Category Tree)
  const fetchLayoutData = async () => {
    try {
      const [sliderRes, catRes] = await Promise.all([
        SliderService.getSliders(),
        CategoryService.getCategoriesWithSub() // Fetch categories with nested subcategories
      ]);
      
      // Fix for Slider API returning { data: { slides: [...] } }
      setSliders(sliderRes.data?.slides || sliderRes.data || []); 
      
      const cats = catRes.data || [];
      setAllCategoriesData(cats);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching layout data:', error);
    }
  };

  // 2. Fetch Products Data (with filters & pagination)
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

  // Setup Initial Data
  useEffect(() => {
    fetchLayoutData();
    fetchProducts(1, false);
  }, []);

  // Sync SubCategories when Category changes
  useEffect(() => {
    if (selectedCategory) {
      const cat = allCategoriesData.find(c => c._id === selectedCategory || c.id === selectedCategory);
      setSubCategories(cat?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, allCategoriesData]);

  // Re-fetch products when filters change
  useEffect(() => {
    // Prevent refetch on initial mount since we already do it
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

  // Render Layout Header (Sliders + Categories + FilterBox)
  const renderHeader = () => (
    <View>
      {/* Hero Slider */}
      {sliders.length > 0 && <HeroSlider data={sliders} />}

      {/* Special Categories Mini-Grid */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>الأقسام</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={{ color: Colors.primary }}>عرض الكل</Text>
        </TouchableOpacity>
      </View>
      
      <InfiniteCategoryScroll 
        data={categories} 
        onPress={(id) => navigation.navigate('ProductsList', { selectedCategoryId: id })}
        colors={colors}
      />

      {/* Latest Products Label */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>جميع المنتجات</Text>
      </View>

      {/* Advanced Filter Box */}
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
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={renderHeader}
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
              <Text style={{ color: colors.textMuted }}>لا توجد منتجات تطابق بحثك</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  infiniteContainer: { 
    height: 100, 
    marginBottom: 20,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  sliderContainer: { 
    height: 180, 
    marginBottom: 20, 
    marginHorizontal: 16, 
    marginTop: 10, 
    borderRadius: 16, 
    overflow: 'hidden',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }),
    elevation: 3,
  },
  sliderImage: { width: SCREEN_WIDTH - 32, height: 180, borderRadius: 16 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  categoryList: { paddingLeft: 16, paddingBottom: 16 },
  indicatorWrapper: {
    height: 4,
    marginHorizontal: 32,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 2,
  },
  categoryCard: { alignItems: 'center', width: 70 },
  categoryIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden'
  },
  categoryImage: { width: 40, height: 40 },
  categoryName: { fontSize: 12, textAlign: 'center' },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  }
});
