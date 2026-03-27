import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Dimensions 
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { ProductService } from '../services/HomeServices';
import { IProduct } from '../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const ProductsListScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(route.params?.initialSearch || '');

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const response = await ProductService.getProducts({ keyword: query, limit: 50 });
      setProducts(response.data.products);
    } catch (err) {
      console.error('Fetch products error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
  }, []);

  const handleSearch = () => {
    fetchProducts(searchQuery);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث عن منتج..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchProducts(''); }}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={80} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>لم نجد أي منتجات تطابق بحثك.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.productCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id || item.id })}
            >
              <Image 
                source={{ uri: item.images[0]?.secure_url }} 
                style={styles.productImage} 
                contentFit="cover" 
              />
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
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 12, borderBottomWidth: 1 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    height: 45, 
    borderRadius: 10, 
    borderWidth: 1,
    gap: 8
  },
  searchInput: { flex: 1, fontSize: 14, textAlign: 'right' },
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
  oldPrice: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 20, textAlign: 'center', fontSize: 16 },
});
