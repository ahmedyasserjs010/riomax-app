import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';

interface CartMergeModalProps {
  visible: boolean;
  guestCart: any;
  userCart: any;
  onResolve: (action: 'merge' | 'keep_guest' | 'keep_user') => Promise<void>;
}

export const CartMergeModal: React.FC<CartMergeModalProps> = ({
  visible,
  guestCart,
  userCart,
  onResolve,
}) => {
  const { colors } = useTheme();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!visible || (!guestCart && !userCart)) return null;

  const guestItems = guestCart?.items?.filter((i: any) => i.Products) || [];
  const userItems = userCart?.items?.filter((i: any) => i.Products) || [];

  const guestTotal = guestItems.reduce((sum: number, item: any) => {
    const p = item.Products;
    const price = p?.priceAfterDiscount || p?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const userTotal = userItems.reduce((sum: number, item: any) => {
    const p = item.Products;
    const price = p?.priceAfterDiscount || p?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const combinedTotal = guestTotal + userTotal;
  const combinedCount = guestItems.length + userItems.length;

  const handleAction = async (action: 'merge' | 'keep_guest' | 'keep_user') => {
    setLoadingAction(action);
    try {
      await onResolve(action);
    } finally {
      setLoadingAction(null);
    }
  };

  const renderSection = (items: any[], title: string, badgeBg: string, badgeColor: string, totalAmount: number, iconName: any) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={iconName} size={18} color={badgeColor} style={{ marginLeft: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {items.length} {items.length === 1 ? 'منتج' : 'منتجات'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.itemList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>لا توجد منتجات</Text>
        ) : (
          items.map((item: any, idx: number) => {
            const product = item.Products;
            const imgUrl = product?.images?.[0]?.secure_url || product?.images?.[0]?.url || null;
            const price = product?.priceAfterDiscount || product?.price || 0;

            return (
              <View key={item._id || idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.itemImage} contentFit="cover" />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: colors.border }]}>
                    <Ionicons name="image-outline" size={20} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {product?.name || 'منتج'}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text style={[styles.itemQty, { color: colors.textMuted }]}>الكمية: {item.quantity}</Text>
                    <Text style={[styles.itemPrice, { color: Colors.primary }]}>
                      {(price * item.quantity).toLocaleString()} ج.م
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.sectionFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionFooterLabel, { color: colors.textMuted }]}>إجمالي هذا القسم:</Text>
        <Text style={[styles.sectionFooterTotal, { color: Colors.primary }]}>{totalAmount.toLocaleString()} ج.م</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="swap-horizontal" size={28} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              تم العثور على منتجات سابقة في حسابك!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              لديك منتجات أضفتها كزائر في الجلسة الحالية، ومنتجات أخرى محفوظة مسبقاً في حسابك. اختر ما يناسبك للمتابعة:
            </Text>
          </View>

          {/* Items lists */}
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {renderSection(
              guestItems,
              'سلة الجلسة الحالية (الزائر)',
              'rgba(249, 115, 22, 0.15)',
              Colors.primary,
              guestTotal,
              'cart-outline'
            )}
            {renderSection(
              userItems,
              'سلة حسابك المسجل',
              'rgba(59, 130, 246, 0.15)',
              '#2563eb',
              userTotal,
              'person-outline'
            )}
          </ScrollView>

          {/* 3 Explicit Purchase Action Cards */}
          <View style={styles.actions}>
            {/* Option 1: Merge & Proceed to Purchase */}
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
              onPress={() => handleAction('merge')}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'merge' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.btnContentRow}>
                  <View style={styles.btnTextCol}>
                    <Text style={styles.primaryBtnText}>دمج السلتين معاً ومتابعة الشراء (الكل)</Text>
                    <Text style={styles.primaryBtnSubtext}>
                      إتمام الشراء بكافة المنتجات ({combinedCount} منتجات - {combinedTotal.toLocaleString()} ج.م)
                    </Text>
                  </View>
                  <Ionicons name="layers-outline" size={22} color="#fff" style={styles.btnIcon} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              {/* Option 2: Guest Cart Only */}
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: Colors.primary, backgroundColor: 'rgba(249, 115, 22, 0.08)' }]}
                onPress={() => handleAction('keep_guest')}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'keep_guest' ? (
                  <ActivityIndicator color={Colors.primary} size="small" />
                ) : (
                  <View style={styles.secondaryBtnCol}>
                    <Text style={[styles.secondaryBtnTitle, { color: Colors.primary }]}>
                      متابعة بسلة الزائر فقط
                    </Text>
                    <Text style={[styles.secondaryBtnSub, { color: colors.textMuted }]}>
                      {guestItems.length} منتج ({guestTotal.toLocaleString()} ج.م)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Option 3: User Cart Only */}
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}
                onPress={() => handleAction('keep_user')}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'keep_user' ? (
                  <ActivityIndicator color="#2563eb" size="small" />
                ) : (
                  <View style={styles.secondaryBtnCol}>
                    <Text style={[styles.secondaryBtnTitle, { color: '#2563eb' }]}>
                      متابعة بسلة الحساب فقط
                    </Text>
                    <Text style={[styles.secondaryBtnSub, { color: colors.textMuted }]}>
                      {userItems.length} منتج ({userTotal.toLocaleString()} ج.م)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  scrollArea: {
    maxHeight: 280,
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemList: {
    maxHeight: 120,
  },
  sectionFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionFooterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionFooterTotal: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 10,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  itemQty: {
    fontSize: 11,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actions: {
    gap: 8,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  btnContentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnTextCol: {
    flex: 1,
  },
  btnIcon: {
    marginLeft: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  primaryBtnSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryBtnCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryBtnSub: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

