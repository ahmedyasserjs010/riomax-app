import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { SliderService, CategoryService, ProductService } from '../services/HomeServices';
import { ISlider, ICategory, IProduct } from '../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [sliders, setSliders] = useState<ISlider[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [sliderData, catData, prodData] = await Promise.all([
        SliderService.getSliders(),
        CategoryService.getAllCategories(),
        ProductService.getProducts({ limit: 10 })
      ]);
      setSliders(sliderData);
      setCategories(catData);
      setProducts(prodData.data.products);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        stickyHeaderIndices={[0]}
      >
        {/* Search Header */}
        <View style={[styles.searchHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProductsList')}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={[styles.searchText, { color: colors.textMuted }]}>ابحث عن أجهزة ريوماكس...</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            data={sliders}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              item.image?.secure_url ? (
                <Image source={{ uri: item.image.secure_url }} style={styles.sliderImage} contentFit="cover" />
              ) : null
            )}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الأقسام</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={{ color: Colors.primary }}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryCard} 
              onPress={() => navigation.navigate('CategoryProducts', { categoryId: item._id, name: item.name })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: item.image?.secure_url }} style={styles.categoryImage} contentFit="contain" />
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Latest Products */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>أحدث المنتجات</Text>
        </View>
        
        <View style={styles.productGrid}>
          {products.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={[styles.productCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            >
              <Image source={{ uri: item.images[0]?.secure_url }} style={styles.productImage} contentFit="cover" />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{item.priceAfterDiscount} ج.م</Text>
                  {item.discountAmountProduct > 0 && (
                    <Text style={styles.oldPrice}>{item.price} ج.م</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHeader: { padding: 12, paddingBottom: 8 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 45, 
    borderRadius: 12, 
    borderWidth: 1, 
    paddingHorizontal: 15,
    gap: 10
  },
  searchText: { fontSize: 14, flex: 1, textAlign: 'right' },
  sliderContainer: { height: 200, marginBottom: 20 },
  sliderImage: { width: width, height: 200 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  categoryList: { paddingLeft: 16, paddingBottom: 16 },
  categoryCard: { alignItems: 'center', marginRight: 20, width: 70 },
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
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
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
});
