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
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { AuthGuard } from '../components/AuthGuard';
import { Ionicons } from '@expo/vector-icons';
import { Breadcrumbs } from '../components/Breadcrumbs';

import { IProduct } from '../types';
import { useToast } from '../context/ToastContext';
import { useGeneralSettings } from '../hooks/useApi';

const { width } = Dimensions.get('window');

const CartItemCard = ({ item, onUpdate, onRemove, colors }: any) => {
  const product = item.Products as IProduct;
  const [localQty, setLocalQty] = React.useState(item.quantity);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  const hasChanged = localQty !== item.quantity;
  const isAtMaxStock = localQty >= (product?.mainQuantity || 0);

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(product._id || product.id, localQty);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!product) return null;

  const currentPrice = product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;

  return (
    <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image 
        source={{ uri: product.images[0]?.secure_url }} 
        style={styles.cartImage} 
        contentFit="cover" 
      />
      <View style={styles.cartInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        
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
          <Text style={styles.price}>{currentPrice} ج.م</Text>
          {product.priceAfterDiscount > 0 && product.priceAfterDiscount < product.price && (
            <Text style={styles.oldPrice}>{product.price} ج.م</Text>
          )}
        </View>
        
        <View style={styles.actionRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              onPress={() => setLocalQty(Math.max(1, localQty - 1))}
              disabled={isUpdating}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.qtyLabel}>
              {isUpdating ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={[styles.qtyText, { color: colors.text }]}>{localQty}</Text>
              )}
            </View>

            <TouchableOpacity 
              onPress={() => {
                if (!isAtMaxStock) {
                  setLocalQty(localQty + 1);
                }
              }}
              disabled={isUpdating || isAtMaxStock}
              style={[
                styles.qtyBtn, 
                { borderColor: colors.border },
                isAtMaxStock && { opacity: 0.3 }
              ]}
            >
              <Ionicons name="add" size={16} color={isAtMaxStock ? colors.textMuted : colors.text} />
            </TouchableOpacity>

            {hasChanged && !isUpdating && (
              <TouchableOpacity 
                onPress={handleConfirm}
                style={styles.confirmBtn}
              >
                <Ionicons name="checkmark-circle" size={26} color={Colors.success} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity onPress={() => onRemove(product._id || product.id)} disabled={isUpdating}>
            <Ionicons name="trash-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>
        
        {isAtMaxStock && (
          <Text style={styles.stockAlert}>الكمية المتاحة فقط {product.mainQuantity} قطع</Text>
        )}
      </View>
    </View>
  );
};

export const CartScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useUser();
  const { showToast } = useToast();
  const { 
    cartItems, 
    cartCount, 
    isLoading, 
    updateCartQuantity, 
    removeFromCart, 
    refreshCart 
  } = useCart();

  const { data: settings } = useGeneralSettings();

  const vatConfig = React.useMemo(() => {
    return {
      enabled: settings?.vatEnabled || false,
      percentage: settings?.vatPercentage || 14
    };
  }, [settings]);

  const subtotal = cartItems.reduce((acc, item) => {
    const product = item.Products as IProduct;
    if (!product) return acc;
    const price = product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;
    return acc + (price * item.quantity);
  }, 0);

  const vat = vatConfig.enabled ? (subtotal * vatConfig.percentage) / 100 : 0;
  const total = subtotal + vat;

  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    try {
      await updateCartQuantity(productId, newQty);
      showToast('تم تحديث الكمية بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الكمية', 'error');
    }
  };

  const handleRemove = async (productId: string) => {
    Alert.alert(
      'حذف المنتج',
      'هل تريد حذف هذا المنتج من السلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
            try {
              await removeFromCart(productId);
              showToast('تم حذف المنتج من السلة', 'info');
            } catch (err) {
              showToast('فشل حذف المنتج', 'error');
            }
          } 
        }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AuthGuard 
          title="لم يتم اضافة منتجات بعد" 
          subtitle="قم بتسجيل الدخول اولا واضف المنتجات"
        >
          <View />
        </AuthGuard>
      </View>
    );
  }

  if (isLoading && cartItems.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 40 }]}>
        <Ionicons name="cart-outline" size={100} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>سلة المشتريات فارغة</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>تبدو سلة مشترياتك فارغة حالياً. ابدأ بالتسوق الآن!</Text>
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.browseBtnText}>تصفح المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Breadcrumbs items={[{ label: 'سلة المشتريات' }]} />

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        onRefresh={refreshCart}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <CartItemCard 
            item={item} 
            colors={colors} 
            onUpdate={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        )}
      />

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {/* Order Summary Details */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>المجموع الفرعي:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{subtotal.toLocaleString()} ج.م</Text>
          </View>
          {vatConfig.enabled && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>ضريبة القيمة المضافة ({vatConfig.percentage}%):</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{vat.toLocaleString()} ج.م</Text>
            </View>
          )}
          <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي الكلي:</Text>
            <Text style={[styles.totalValue, { color: Colors.primary }]}>{total.toLocaleString()} ج.م</Text>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={[styles.continueBtn, { borderColor: Colors.primary }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <Text style={[styles.continueBtnText, { color: Colors.primary }]}>متابعة التسوق</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutBtnText}>إتمام الشراء ({cartCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 250 },
  cartCard: { 
    flexDirection: 'row', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16, 
    borderWidth: 1,
    overflow: 'hidden',
  },
  cartImage: { width: 90, height: 90, borderRadius: 8 },
  cartInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 14, fontWeight: 'bold', textAlign: 'left' },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  oldPrice: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyLabel: { minWidth: 24, alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: 'bold' },
  confirmBtn: { marginLeft: 4 },
  stockAlert: { fontSize: 11, color: Colors.accent, fontWeight: '600', marginTop: 4 },
  footer: { 
    position: 'absolute', bottom: 30, width: width * 0.95, 
    alignSelf: 'center',
    padding: 16, borderRadius: 20, borderTopWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 10
  },
  summaryContainer: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '500' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  totalValue: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  footerActions: { flexDirection: 'row', gap: 12 },
  continueBtn: { 
    flex: 1,
    height: 50, 
    borderRadius: 12, 
    borderWidth: 1.5,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  continueBtnText: { fontSize: 15, fontWeight: 'bold' },
  checkoutBtn: { 
    flex: 1.5,
    backgroundColor: Colors.primary, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  browseBtn: { 
    marginTop: 30, 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 25 
  },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});
