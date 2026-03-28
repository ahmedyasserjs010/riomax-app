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
import { IProduct } from '../types';

const { width } = Dimensions.get('window');

export const CartScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useUser();
  const { 
    cartItems, 
    cartCount, 
    isLoading, 
    addToCart, 
    removeFromCart, 
    refreshCart 
  } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const product = item.Products as IProduct;
      return acc + (product.priceAfterDiscount * item.quantity);
    }, 0);
  };

  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number) => {
    try {
      if (currentQty + delta <= 0) {
        Alert.alert(
          'حذف المنتج',
          'هل تريد حذف هذا المنتج من السلة؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: () => removeFromCart(productId) }
          ]
        );
      } else {
        // Simple logic for mobile: add +1 or -1
        await addToCart(productId, delta);
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل في تحديث الكمية');
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
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseBtnText}>تصفح المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        onRefresh={refreshCart}
        refreshing={isLoading}
        renderItem={({ item }) => {
          const product = item.Products as IProduct;
          if (!product) return null;
          return (
            <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image 
                source={{ uri: product.images[0]?.secure_url }} 
                style={styles.cartImage} 
                contentFit="cover" 
              />
              <View style={styles.cartInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.price}>{product.priceAfterDiscount} ج.م</Text>
                
                <View style={styles.actionRow}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      onPress={() => handleUpdateQuantity(product._id || product.id, item.quantity, -1)}
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                    >
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => handleUpdateQuantity(product._id || product.id, item.quantity, 1)}
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity onPress={() => removeFromCart(product._id || product.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textMuted }]}>إجمالي السلة:</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{calculateTotal()} ج.م</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>إتمام الشراء ({cartCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 150 },
  cartCard: { 
    flexDirection: 'row', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16, 
    borderWidth: 1,
    overflow: 'hidden',
  },
  cartImage: { width: 80, height: 80, borderRadius: 8 },
  cartInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 14, fontWeight: '500', textAlign: 'left' },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 15, fontWeight: 'bold' },
  footer: { 
    position: 'absolute', bottom: 0, width: width, 
    padding: 20, paddingBottom: 35, borderTopWidth: 1 
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: { 
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
