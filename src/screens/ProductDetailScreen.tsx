import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Share,
  Alert,
  FlatList,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { ProductService } from '../services/HomeServices';
import { IProduct } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { colors, isDark } = useTheme();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const data = await ProductService.getProductById(productId);
        setProduct(data);

        // Fetch related products from the same category
        if (data.category && (data.category._id || data.category.id)) {
          const catId = data.category._id || data.category.id;
          const relatedRes = await ProductService.getProducts({ category: catId, limit: 10 });
          const filteredRelated = (relatedRes.data?.products || []).filter(
            (p: IProduct) => (p._id || p.id) !== (data._id || data.id)
          );
          setRelatedProducts(filteredRelated);
        }
      } catch (err) {
        console.error('Fetch product error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product._id || product.id, quantity);
      Alert.alert('نجاح', 'تم إضافة المنتج إلى السلة بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل في إضافة المنتج للسلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `تفقد هذا المنتج الرائع من ريوماكس: ${product.name} - ${product.priceAfterDiscount} ج.م\nhttps://riomax.com.eg/product/${product._id || product.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>المنتج غير موجود</Text>
      </View>
    );
  }

  const isFavorite = isInWishlist(product._id || product.id);
  const outOfStock = product.mainQuantity === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Main Image Slider */}
        <View style={styles.imageContainer}>
          <FlatList 
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => item.public_id || index.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item.secure_url }} 
                style={[styles.mainImage, { backgroundColor: isDark ? colors.card : '#f8fafc' }]} 
                contentFit="contain" 
              />
            )}
          />
          
          {/* Pagination Dots */}
          {product.images && product.images.length > 1 && (
            <View style={styles.paginationContainer}>
              {product.images.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    i === activeImageIndex ? styles.activeDot : { backgroundColor: colors.border }
                  ]} 
                />
              ))}
            </View>
          )}

          {/* Floating Action Buttons */}
          <TouchableOpacity 
            style={[styles.floatingBtn, styles.backButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingBtn, styles.shareButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]} 
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          {/* Header Info */}
          <View style={styles.tagsContainer}>
            {product.category?.name && (
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{product.category.name}</Text>
              </View>
            )}
            {product.subCategory?.name && (
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{product.subCategory.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <TouchableOpacity onPress={() => toggleWishlist(product._id || product.id)}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={28} 
                color={isFavorite ? Colors.accent : colors.textMuted} 
              />
            </TouchableOpacity>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.priceAfterDiscount} ج.م</Text>
            {product.discountAmountProduct > 0 && (
              <View style={styles.discountContainer}>
                <Text style={styles.oldPrice}>{product.price} ج.م</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>وفر {product.discountAmountProduct} ج.م</Text>
                </View>
              </View>
            )}
          </View>

          {/* Inventory Info */}
          <View style={[styles.inventoryBox, { backgroundColor: isDark ? colors.card : '#f8fafc', borderColor: colors.border }]}>
            <Ionicons 
              name={!outOfStock ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={!outOfStock ? Colors.success : Colors.error} 
            />
            <Text style={[styles.inventoryText, { color: colors.text }]}>
              {!outOfStock ? `متوفر في المخزون (${product.mainQuantity} قطعة)` : 'هذا المنتج غير متوفر حالياً'}
            </Text>
          </View>

          {/* Description */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>وصف المنتج</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
          </Text>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionLabel, { color: colors.text }]}>منتجات تنتمي لهذا القسم</Text>
              <View style={styles.relatedGrid}>
                {relatedProducts.map(item => (
                  <ProductCard 
                    key={item._id || item.id} 
                    product={item} 
                    onPress={() => navigation.push('ProductDetail', { productId: item._id || item.id })} 
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
            style={[styles.qtyBtn, { borderColor: colors.border, opacity: outOfStock ? 0.5 : 1 }]}
            disabled={outOfStock}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: colors.text, opacity: outOfStock ? 0.5 : 1 }]}>{quantity}</Text>
          <TouchableOpacity 
            onPress={() => setQuantity(q => q + 1)}
            style={[styles.qtyBtn, { borderColor: colors.border, opacity: outOfStock ? 0.5 : 1 }]}
            disabled={outOfStock}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[
            styles.addCartBtn, 
            { backgroundColor: !outOfStock ? Colors.primary : colors.border }
          ]}
          disabled={addingToCart || outOfStock}
          onPress={handleAddToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addCartText}>{!outOfStock ? 'أضف إلى السلة' : 'نفذت الكمية'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: width, height: width, position: 'relative' },
  mainImage: { width: width, height: width },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  floatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }),
    elevation: 3,
  },
  backButton: { right: 20 },
  shareButton: { left: 20 },
  detailsContainer: { padding: 20 },
  tagsContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tagPill: {
    backgroundColor: '#334155', // dark slate
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  productName: { fontSize: 22, fontWeight: 'bold', flex: 1, marginLeft: 10, textAlign: 'right' },
  priceRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 20 },
  price: { fontSize: 26, fontWeight: '900', color: Colors.primary },
  discountContainer: { alignItems: 'flex-end', gap: 4 },
  oldPrice: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through' },
  badge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: Colors.accent, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 24 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'right' },
  description: { fontSize: 15, lineHeight: 26, textAlign: 'right', fontWeight: '500' },
  inventoryBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginTop: 10,
    gap: 8
  },
  inventoryText: { fontSize: 15, fontWeight: '600' },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: { 
    position: 'absolute', bottom: 0, width: width, height: 90, 
    paddingHorizontal: 20, flexDirection: 'row', 
    alignItems: 'center', gap: 15, borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0
  },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 20, fontWeight: 'bold' },
  addCartBtn: { flex: 1, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
