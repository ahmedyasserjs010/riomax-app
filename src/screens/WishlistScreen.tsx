import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { IProduct } from '../types';

const { width } = Dimensions.get('window');

export const WishlistScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { wishlist, toggleWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product: IProduct) => {
    try {
      await addToCart(product._id || product.id, 1);
      Alert.alert('نجاح', 'تم إضافة المنتج إلى السلة');
    } catch (err: any) {
      console.error(err);
    }
  };

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
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseBtnText}>اكتشف المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const product = item;
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
                  <Text style={styles.price}>{product.priceAfterDiscount} ج.م</Text>
                </View>
              </TouchableOpacity>
              
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => toggleWishlist(product._id || product.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.accent} />
                  <Text style={[styles.actionText, { color: Colors.accent }]}>حذف</Text>
                </TouchableOpacity>
                <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleAddToCart(product)}
                >
                  <Ionicons name="cart-outline" size={18} color={Colors.primary} />
                  <Text style={[styles.actionText, { color: Colors.primary }]}>سلة التسوق</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

// ... using Alert here so need to import it
import { Alert } from 'react-native';

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
  name: { fontSize: 14, fontWeight: '500', textAlign: 'left' },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginTop: 4 },
  actions: { flexDirection: 'row', borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  actionText: { fontSize: 14, fontWeight: '600' },
  vDivider: { width: 1, height: '100%' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  browseBtn: { marginTop: 30, backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});
