import React, { useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { Breadcrumbs } from '../components/Breadcrumbs';

import { IProduct } from '../types';
import { useToast } from '../context/ToastContext';
import { useGeneralSettings } from '../hooks/useApi';
import { getProductPrice, hasProductDiscount, getProductImage } from '../utils/productHelpers';

const placeholderImage = require('../../assets/icon.png');
const { width } = Dimensions.get('window');

/* ============================================================
   ACTIVE CART ITEM CARD
============================================================ */
const CartItemCard = ({ item, onUpdate, onRemove, onToggleSaved, colors, navigation }: any) => {
  const product = item.Products as IProduct;
  const [localQty, setLocalQty] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const currentPrice = getProductPrice(product);
  const hasDiscount = hasProductDiscount(product);
  const imageUrl = getProductImage(product);

  return (
    <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        onPress={() => navigation?.navigate('ProductDetail', { productId: product._id || product.id })}
        activeOpacity={0.7}
      >
        <Image 
          source={imageUrl ? { uri: imageUrl } : placeholderImage} 
          style={styles.cartImage} 
          contentFit="cover" 
        />
      </TouchableOpacity>
      
      <View style={styles.cartInfo}>
        <TouchableOpacity 
          onPress={() => navigation?.navigate('ProductDetail', { productId: product._id || product.id })}
          activeOpacity={0.7}
        >
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        </TouchableOpacity>
        
        <View style={styles.tagsContainer}>
          {Boolean(product.category?.name) ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText} numberOfLines={1}>{product.category.name}</Text>
            </View>
          ) : null}
          {Boolean(product.subCategory?.name || product.subCategory) ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText} numberOfLines={1}>
                {typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{currentPrice} ج.م</Text>
          {hasDiscount ? (
            <Text style={styles.oldPrice}>{product.price} ج.م</Text>
          ) : null}
        </View>
        
        <View style={styles.actionRow}>
          {/* Quantity Controls */}
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

            {Boolean(hasChanged && !isUpdating) ? (
              <TouchableOpacity 
                onPress={handleConfirm}
                style={styles.confirmBtn}
              >
                <Ionicons name="checkmark-circle" size={26} color={Colors.success} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* Item Actions: Save for later & Delete */}
          <View style={styles.itemActionsRight}>
            <TouchableOpacity 
              onPress={() => onToggleSaved(product._id || product.id)}
              style={[styles.actionIconBtn, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}
              accessibilityLabel="حفظ لطلب لاحق"
            >
              <Ionicons name="bookmark-outline" size={17} color="#f59e0b" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onRemove(product._id || product.id)} 
              disabled={isUpdating}
              style={[styles.actionIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
              accessibilityLabel="حذف من السلة"
            >
              <Ionicons name="trash-outline" size={17} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
        
        {isAtMaxStock ? (
          <Text style={styles.stockAlert}>الكمية المتاحة فقط {product.mainQuantity} قطع</Text>
        ) : null}
      </View>
    </View>
  );
};

/* ============================================================
   SAVED FOR LATER ITEM CARD
============================================================ */
const SavedItemCard = ({ item, onToggleSaved, onRemove, colors, navigation }: any) => {
  const product = item.Products as IProduct;
  if (!product) return null;
  const currentPrice = getProductPrice(product);
  const imageUrl = getProductImage(product);

  return (
    <View style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        onPress={() => navigation?.navigate('ProductDetail', { productId: product._id || product.id })}
        activeOpacity={0.7}
      >
        <Image 
          source={imageUrl ? { uri: imageUrl } : placeholderImage} 
          style={styles.savedImage} 
          contentFit="cover" 
        />
      </TouchableOpacity>
      
      <View style={styles.savedInfo}>
        <TouchableOpacity 
          onPress={() => navigation?.navigate('ProductDetail', { productId: product._id || product.id })}
          activeOpacity={0.7}
        >
          <Text style={[styles.savedProductName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.savedPriceRow}>
          <Text style={styles.price}>{currentPrice} ج.م</Text>
          <Text style={[styles.savedQtyText, { color: colors.textMuted }]}>
            (الكمية: {item.quantity})
          </Text>
        </View>

        <View style={styles.savedActionRow}>
          <TouchableOpacity
            style={[styles.moveToCartBtn, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}
            onPress={() => onToggleSaved(product._id || product.id)}
          >
            <Ionicons name="cart-outline" size={15} color={Colors.primary} style={{ marginLeft: 4 }} />
            <Text style={[styles.moveToCartText, { color: Colors.primary }]}>
              نقل إلى السلة الآن
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onRemove(product._id || product.id)}
            style={[styles.deleteSavedBtn, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* ============================================================
   MAIN CART SCREEN
============================================================ */
export const CartScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useUser();
  const { showToast } = useToast();
  const { 
    cartItems, 
    savedItems,
    cartCount, 
    savedCount,
    isLoading, 
    updateCartQuantity, 
    removeFromCart, 
    clearActiveCart,
    clearSavedCart,
    toggleSaved,
    mergeAllSaved,
    conflictData,
    resolveConflict,
    refreshCart 
  } = useCart();

  const { data: settings } = useGeneralSettings();
  const [resolvingAction, setResolvingAction] = useState<string | null>(null);

  const vatConfig = React.useMemo(() => {
    return {
      enabled: settings?.vatEnabled || false,
      percentage: settings?.vatPercentage || 14
    };
  }, [settings]);

  const hasActiveItems = cartItems.length > 0;
  const hasSavedItems = savedItems.length > 0;
  const isTotallyEmpty = !hasActiveItems && !hasSavedItems;

  // Subtotal exclusively for active items
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

  const handleRemoveActive = async (productId: string) => {
    Alert.alert(
      'حذف المنتج',
      'هل تريد حذف هذا المنتج من سلة المشتريات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await removeFromCart(productId, false);
              showToast('تم حذف المنتج من السلة', 'info');
            } catch (err) {
              showToast('فشل حذف المنتج', 'error');
            }
          } 
        }
      ]
    );
  };

  const handleRemoveSaved = async (productId: string) => {
    Alert.alert(
      'حذف من المحفوظات',
      'هل تريد حذف هذا المنتج من قائمة المحفوظات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await removeFromCart(productId, true);
              showToast('تم حذف المنتج من المحفوظات', 'info');
            } catch (err) {
              showToast('فشل حذف المنتج', 'error');
            }
          } 
        }
      ]
    );
  };

  const handleToggleSaved = async (productId: string) => {
    try {
      await toggleSaved(productId);
      showToast('تم تحديث حالة المنتج بنجاح', 'success');
    } catch (err) {
      showToast('فشل تحديث المنتج', 'error');
    }
  };

  const handleMergeAllSaved = async () => {
    try {
      await mergeAllSaved();
      showToast('تم دمج كافة المنتجات المحفوظة في السلة 🛒', 'success');
    } catch (err) {
      showToast('فشل دمج المنتجات', 'error');
    }
  };

  const handleClearActive = () => {
    Alert.alert(
      'مسح السلة النشطة',
      'هل أنت متأكد من تفريغ السلة النشطة؟ (ستبقى المنتجات المحفوظة لطلب لاحق في حسابك دون حذف)',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح السلة',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearActiveCart();
              showToast('تم تفريغ السلة النشطة بنجاح', 'info');
            } catch (err) {
              showToast('فشل تفريغ السلة', 'error');
            }
          }
        }
      ]
    );
  };

  const handleClearSaved = () => {
    Alert.alert(
      'مسح المحفوظات',
      'هل أنت متأكد من مسح كافة المنتجات المحفوظة لطلب لاحق؟ (ستبقى سلة الشراء الحالية دون تغيير)',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح المحفوظات',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSavedCart();
              showToast('تم مسح المنتجات المحفوظة بنجاح', 'info');
            } catch (err) {
              showToast('فشل مسح المحفوظات', 'error');
            }
          }
        }
      ]
    );
  };

  const handleResolveConflict = async (action: 'merge' | 'keep_guest' | 'keep_user') => {
    setResolvingAction(action);
    try {
      await resolveConflict(action);
      showToast('تم تحديث السلة بنجاح لمتابعة الشراء 🎉', 'success');
    } catch (err) {
      showToast('فشل تحديث السلة', 'error');
    } finally {
      setResolvingAction(null);
    }
  };

  if (isLoading && isTotallyEmpty) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isTotallyEmpty) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 40 }]}>
        <Ionicons name="cart-outline" size={100} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>سلة المشتريات فارغة</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          تبدو سلة مشترياتك فارغة حالياً. ابدأ بالتسوق الآن!
        </Text>
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
              })
            );
          }}
        >
          <Text style={styles.browseBtnText}>تصفح المنتجات</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Breadcrumbs items={[{ label: 'سلة المشتريات' }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshCart} />}
      >
        {/* 🌟 CONFLICT BANNER IF GUEST & USER CARTS COEXIST */}
        {conflictData && (
          <View style={[styles.conflictBanner, { backgroundColor: colors.card, borderColor: Colors.primary }]}>
            <View style={styles.conflictHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
              <Text style={[styles.conflictTitle, { color: colors.text }]}>
                تم العثور على سلتين: سلة الزائر وسلة حسابك!
              </Text>
            </View>
            <Text style={[styles.conflictSubtext, { color: colors.textMuted }]}>
              اختر مسار المتابعة للشراء الآن. لن يتم حذف أي منتج؛ بل يُحفظ الآخر في حسابك بأمان.
            </Text>

            <View style={styles.conflictActionsRow}>
              {/* Option 1: Merge All */}
              <TouchableOpacity
                style={[styles.conflictBtnPrimary, { backgroundColor: Colors.primary }]}
                onPress={() => handleResolveConflict('merge')}
                disabled={resolvingAction !== null}
              >
                {resolvingAction === 'merge' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="layers-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
                    <Text style={styles.conflictBtnPrimaryText}>دمج السلتين (شراء الكل)</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Option 2: Keep Guest */}
              <TouchableOpacity
                style={[styles.conflictBtnSecondary, { borderColor: Colors.primary }]}
                onPress={() => handleResolveConflict('keep_guest')}
                disabled={resolvingAction !== null}
              >
                {resolvingAction === 'keep_guest' ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={[styles.conflictBtnSecondaryText, { color: Colors.primary }]}>
                    متابعة بسلة الزائر
                  </Text>
                )}
              </TouchableOpacity>

              {/* Option 3: Keep User */}
              <TouchableOpacity
                style={[styles.conflictBtnSecondary, { borderColor: '#2563eb' }]}
                onPress={() => handleResolveConflict('keep_user')}
                disabled={resolvingAction !== null}
              >
                {resolvingAction === 'keep_user' ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Text style={[styles.conflictBtnSecondaryText, { color: '#2563eb' }]}>
                    متابعة بسلة الحساب
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ============================================================
            🛒 SECTION 1: ACTIVE CART ITEMS (READY FOR CHECKOUT)
        ============================================================ */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <View style={[styles.activeDot, { backgroundColor: Colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              المنتجات الجاهزة للشراء الآن
            </Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: Colors.primary }]}>{cartItems.length}</Text>
            </View>
          </View>

          {hasActiveItems && (
            <TouchableOpacity 
              onPress={handleClearActive}
              style={styles.clearSectionBtn}
            >
              <Ionicons name="trash-outline" size={14} color={Colors.accent} />
              <Text style={[styles.clearSectionText, { color: Colors.accent }]}>مسح السلة</Text>
            </TouchableOpacity>
          )}
        </View>

        {hasActiveItems ? (
          cartItems.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              colors={colors}
              onUpdate={handleUpdateQuantity}
              onRemove={handleRemoveActive}
              onToggleSaved={handleToggleSaved}
              navigation={navigation}
            />
          ))
        ) : (
          <View style={[styles.emptyActiveBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="cart-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyActiveTitle, { color: colors.text }]}>
              سلة الشراء الحالية فارغة
            </Text>
            <Text style={[styles.emptyActiveSub, { color: colors.textMuted }]}>
              لديك منتجات محفوظة أدناه. يمكنك نقل أي منها أو دمجها للشراء فوراً!
            </Text>
            {hasSavedItems && (
              <TouchableOpacity
                style={[styles.mergeQuickBtn, { backgroundColor: Colors.primary }]}
                onPress={handleMergeAllSaved}
              >
                <Ionicons name="refresh-outline" size={16} color="#fff" style={{ marginLeft: 6 }} />
                <Text style={styles.mergeQuickBtnText}>دمج كل المحفوظ في السلة الآن</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ============================================================
            📦 SECTION 2: SAVED FOR LATER (PRESERVED SAFELY)
        ============================================================ */}
        {hasSavedItems && (
          <View style={styles.savedSectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithBadge}>
                <Ionicons name="bookmark" size={18} color="#f59e0b" style={{ marginLeft: 4 }} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  منتجات محفوظة لطلب لاحق
                </Text>
                <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={[styles.badgeText, { color: '#d97706' }]}>{savedItems.length}</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleClearSaved}
                style={styles.clearSectionBtn}
              >
                <Ionicons name="trash-outline" size={14} color={Colors.accent} />
                <Text style={[styles.clearSectionText, { color: Colors.accent }]}>مسح المحفوظات</Text>
              </TouchableOpacity>
            </View>

            {/* Merge All Saved Button in Section Header */}
            <TouchableOpacity
              style={[styles.mergeAllSavedHeaderBtn, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}
              onPress={handleMergeAllSaved}
            >
              <Ionicons name="layers-outline" size={18} color={Colors.primary} />
              <Text style={[styles.mergeAllSavedHeaderText, { color: Colors.primary }]}>
                ⚡ دمج كل المحفوظ في السلة للشراء الآن
              </Text>
            </TouchableOpacity>

            {savedItems.map((item) => (
              <SavedItemCard
                key={item._id}
                item={item}
                colors={colors}
                onToggleSaved={handleToggleSaved}
                onRemove={handleRemoveSaved}
                navigation={navigation}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ============================================================
          ORDER SUMMARY FOOTER (CALCULATES BASED ON ACTIVE ITEMS ONLY)
      ============================================================ */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              المجموع الفرعي ({cartCount} منتجات):
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{subtotal.toLocaleString()} ج.م</Text>
          </View>
          {vatConfig.enabled ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                ضريبة القيمة المضافة ({vatConfig.percentage}%):
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{vat.toLocaleString()} ج.م</Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي الكلي:</Text>
            <Text style={[styles.totalValue, { color: Colors.primary }]}>{total.toLocaleString()} ج.م</Text>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={[styles.continueBtn, { borderColor: Colors.primary }]}
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'Products' } }],
                })
              );
            }}
          >
            <Text style={[styles.continueBtnText, { color: Colors.primary }]}>متابعة التسوق</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.checkoutBtn, !hasActiveItems && { opacity: 0.5 }]}
            disabled={!hasActiveItems}
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
  scrollContent: { padding: 16, paddingBottom: 260 },
  
  // Conflict Banner
  conflictBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  conflictHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  conflictTitle: { fontSize: 15, fontWeight: 'bold' },
  conflictSubtext: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  conflictActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conflictBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  conflictBtnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  conflictBtnSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  conflictBtnSecondaryText: { fontSize: 12, fontWeight: '600' },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  clearSectionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  clearSectionText: { fontSize: 12, fontWeight: '600' },

  // Cart Item Card
  cartCard: { 
    flexDirection: 'row', 
    borderRadius: 14, 
    padding: 12, 
    marginBottom: 14, 
    borderWidth: 1,
    overflow: 'hidden',
  },
  cartImage: { width: 88, height: 88, borderRadius: 10 },
  cartInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 14, fontWeight: 'bold', textAlign: 'left' },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  oldPrice: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  qtyLabel: { minWidth: 20, alignItems: 'center' },
  qtyText: { fontSize: 15, fontWeight: 'bold' },
  confirmBtn: { marginLeft: 2 },
  itemActionsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionIconBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stockAlert: { fontSize: 11, color: Colors.accent, fontWeight: '600', marginTop: 4 },

  // Empty Active Box
  emptyActiveBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyActiveTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  emptyActiveSub: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  mergeQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mergeQuickBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  // Saved Section
  savedSectionContainer: { marginTop: 14 },
  mergeAllSavedHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  mergeAllSavedHeaderText: { fontSize: 13, fontWeight: 'bold' },

  // Saved Item Card
  savedCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  savedImage: { width: 75, height: 75, borderRadius: 10 },
  savedInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  savedProductName: { fontSize: 13, fontWeight: 'bold', textAlign: 'left' },
  savedPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  savedQtyText: { fontSize: 12 },
  savedActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  moveToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moveToCartText: { fontSize: 12, fontWeight: 'bold' },
  deleteSavedBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // Footer
  footer: { 
    position: 'absolute', bottom: 20, width: width * 0.95, 
    alignSelf: 'center',
    padding: 16, borderRadius: 20, borderTopWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 10
  },
  summaryContainer: { marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '500' },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 17, fontWeight: 'bold' },
  footerActions: { flexDirection: 'row', gap: 10 },
  continueBtn: { 
    flex: 1,
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1.5,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  continueBtnText: { fontSize: 14, fontWeight: 'bold' },
  checkoutBtn: { 
    flex: 1.4,
    backgroundColor: Colors.primary, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
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
