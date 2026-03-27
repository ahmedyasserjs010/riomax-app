import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { IProduct } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';

interface ProductCardProps {
  product: IProduct;
  onPress: () => void;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

const { width } = Dimensions.get('window');

// 2 columns with 16px padding on sides and 8px gap
const CARD_WIDTH = (width - 32 - 8) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted = false 
}) => {
  const { colors, isDark } = useTheme();
  
  const isOutOfStock = product.mainQuantity === 0;

  return (
    <TouchableOpacity 
      style={[
        styles.cardContainer, 
        { backgroundColor: isDark ? colors.card : '#ffffff' }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.images[0]?.secure_url }} 
          style={styles.image} 
          contentFit="contain" 
        />
        
        {/* Wishlist Button (Top Left) */}
        <TouchableOpacity 
          style={styles.wishlistBtn} 
          onPress={onToggleWishlist}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isWishlisted ? "heart" : "heart-outline"} 
            size={20} 
            color={isWishlisted ? Colors.accent : '#fff'} 
          />
        </TouchableOpacity>

        {/* Out of Stock Badge (Top Right) */}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>نفذت الكمية</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Tags / Pills */}
        <View style={styles.tagsContainer}>
          {product.category?.name && (
            <View style={styles.tagPill}>
              <Text style={styles.tagText} numberOfLines={1}>{product.category.name}</Text>
            </View>
          )}
          {product.subCategory?.name && (
            <View style={styles.tagPill}>
              <Text style={styles.tagText} numberOfLines={1}>{product.subCategory.name}</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceText}>{product.priceAfterDiscount} ج.م</Text>
          {product.discountAmountProduct > 0 && (
            <Text style={styles.oldPrice}>{product.price} ج.م</Text>
          )}
        </View>

        {/* Stock & Cart Button Row */}
        <View style={styles.footerRow}>
          <View style={styles.stockContainer}>
            {!isOutOfStock ? (
              <Text style={styles.stockTextAvailable}>
                الكمية المتاحة ({product.mainQuantity}) قطعة
              </Text>
            ) : (
              <Text style={styles.stockTextEmpty}>غير متوفر حالياً</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.cartBtn, isOutOfStock && styles.cartBtnDisabled]}
            disabled={isOutOfStock}
            onPress={onAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    alignItems: 'center',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 }),
    elevation: 3,
    paddingBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8fafc',
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // semi-transparent dark blue
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 10,
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 40,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: '#334155', // dark slate
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  stockContainer: {
    flex: 1,
    paddingRight: 5,
  },
  stockTextAvailable: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981', // emerald-500
    textAlign: 'right',
  },
  stockTextEmpty: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.accent,
    textAlign: 'right',
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' 
      ? { boxShadow: `0px 4px 8px ${Colors.primary}40` } as any
      : { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }),
    elevation: 4,
  },
  cartBtnDisabled: {
    backgroundColor: '#cbd5e1', // slate-300
    shadowOpacity: 0,
    elevation: 0,
  },
});
