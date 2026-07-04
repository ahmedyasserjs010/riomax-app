import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { AuthGuard } from '../components/AuthGuard';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Breadcrumbs } from '../components/Breadcrumbs';

import { IProduct } from '../types';

const { width } = Dimensions.get('window');

export const WishlistScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { wishlist, toggleWishlist, isLoading, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useUser();
  const { showToast } = useToast();

  const handleAddToCart = async (product: IProduct) => {
    try {
      await addToCart(product._id || product.id, 1);
      showToast('تم إضافة المنتج إلى السلة بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في إضافة المنتج للسلة', 'error');
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      const isFav = isInWishlist(productId);
      showToast(isFav ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة', 'info');
    } catch (err: any) {
        showToast('فشل في تعديل المفضلة', 'error');
    }
  };


  if (!isAuthenticated) {
    return (
      <AuthGuard 
      title="لم يتم اضافة منتجات بعد" 
      subtitle="قم بتسجيل الدخول اولا واضف المنتجات"
    >
        <View />
      </AuthGuard>
    );
  }

  if (isLoading && wishlist.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (wishlist.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 40 }]}>
        <Ionicons name="heart-dislike-outline" size={100} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>المفضلة فارغة</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>لم تقم بإضافة أي منتجات للمفضلة بعد.</Text>
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.browseBtnText}>اكتشف المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Breadcrumbs items={[{ label: 'المفضلة' }]} />

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const product = item;
          const alreadyInCart = isInCart(product._id || product.id);
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.cardContent}
                onPress={() => navigation.navigate('ProductDetail', { productId: product._id || product.id })}
              >
                <Image 
                  source={{ uri: product.images[0]?.secure_url }} 
                  style={styles.image} 
                  contentFit="cover" 
                />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
                  
                  <View style={styles.tagsContainer}>
                    {product.category?.name && (
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText} numberOfLines={1}>{product.category.name}</Text>
                      </View>
                    )}
                    {(product.subCategory?.name || product.subCategory) && (
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText} numberOfLines={1}>
                          {typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price} ج.م
                    </Text>
                    {product.priceAfterDiscount > 0 && product.priceAfterDiscount < product.price && (
                      <Text style={styles.oldPrice}>{product.price} ج.م</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleToggleWishlist(product._id || product.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.accent} />
                  <Text style={[styles.actionText, { color: Colors.accent }]}>حذف</Text>
                </TouchableOpacity>
                <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
                <TouchableOpacity 
                  style={[styles.actionBtn, alreadyInCart && { backgroundColor: Colors.success + '20' }]}
                  onPress={() => handleAddToCart(product)}
                >
                  <Ionicons 
                    name={alreadyInCart ? "checkmark-circle" : "cart-outline"} 
                    size={18} 
                    color={alreadyInCart ? Colors.success : Colors.primary} 
                  />
                  <Text style={[styles.actionText, { color: alreadyInCart ? Colors.success : Colors.primary }]}>
                    {alreadyInCart ? 'في السلة' : 'سلة التسوق'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { 
    borderRadius: 12, 
    marginBottom: 16, 
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  image: { width: 70, height: 70, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginBottom: 6 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  oldPrice: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  actionText: { fontSize: 14, fontWeight: '600' },
  vDivider: { width: 1, height: '100%' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  browseBtn: { marginTop: 30, backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});
