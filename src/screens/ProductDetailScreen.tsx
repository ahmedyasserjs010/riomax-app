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
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { ProductService } from '../services/HomeServices';
import { IProduct } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ProductService.getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Fetch product error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
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
        message: `تفقد هذا المنتج الرائع من ريوماكس: ${product.name} - ${product.priceAfterDiscount} ج.م\nhttps://riomax.com.eg/category/${product.category.name}/${product.subCategory.name}`,
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.images[0]?.secure_url }} 
            style={styles.mainImage} 
            contentFit="cover" 
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          {/* Header Info */}
          <Text style={[styles.categoryPath, { color: colors.textMuted }]}>
            {product.category.name} / {product.subCategory.name}
          </Text>
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

          {/* Description */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>وصف المنتج</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
          </Text>

          {/* Inventory Info */}
          <View style={[styles.inventoryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons 
              name={product.mainQuantity > 0 ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.mainQuantity > 0 ? Colors.success : Colors.error} 
            />
            <Text style={{ color: colors.text, marginLeft: 8 }}>
              {product.mainQuantity > 0 ? `متوفر في المخزون (${product.mainQuantity})` : 'نفدت الكمية'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
          <TouchableOpacity 
            onPress={() => setQuantity(q => q + 1)}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[
            styles.addCartBtn, 
            { backgroundColor: product.mainQuantity > 0 ? Colors.primary : colors.border }
          ]}
          disabled={addingToCart || product.mainQuantity <= 0}
          onPress={handleAddToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addCartText}>أضف إلى السلة</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: width, height: width, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  backButton: { 
    position: 'absolute', top: 50, left: 20, 
    backgroundColor: '#ffffffaa', padding: 8, borderRadius: 20 
  },
  shareButton: { 
    position: 'absolute', top: 50, right: 20, 
    backgroundColor: '#ffffffaa', padding: 8, borderRadius: 20 
  },
  detailsContainer: { padding: 20 },
  categoryPath: { fontSize: 13, marginBottom: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  productName: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 10, textAlign: 'left' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 20 },
  price: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  discountContainer: { alignItems: 'flex-start', gap: 4 },
  oldPrice: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through' },
  badge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  divider: { height: 1, marginVertical: 20 },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'left' },
  description: { fontSize: 15, lineHeight: 22, textAlign: 'left' },
  inventoryBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    marginTop: 20 
  },
  footer: { 
    position: 'absolute', bottom: 0, width: width, height: 90, 
    paddingHorizontal: 20, flexDirection: 'row', 
    alignItems: 'center', gap: 15, borderTopWidth: 1 
  },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: 'bold' },
  addCartBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
