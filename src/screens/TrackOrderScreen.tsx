import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Alert 
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Breadcrumbs } from '../components/Breadcrumbs';

const STATUS_MAP: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  pending: { label: 'قيد المراجعة', color: '#d97706', icon: 'time-outline', bg: 'rgba(217, 119, 6, 0.1)' },
  confirmed: { label: 'تم التأكيد', color: '#2563eb', icon: 'checkmark-circle-outline', bg: 'rgba(37, 99, 235, 0.1)' },
  processing: { label: 'جاري التجهيز', color: '#4f46e5', icon: 'cube-outline', bg: 'rgba(79, 70, 229, 0.1)' },
  shipped: { label: 'تم الشحن', color: '#7c3aed', icon: 'airplane-outline', bg: 'rgba(124, 58, 237, 0.1)' },
  delivered: { label: 'تم التوصيل', color: '#16a34a', icon: 'checkmark-done-circle-outline', bg: 'rgba(22, 163, 74, 0.1)' },
  cancelled: { label: 'ملغي', color: '#dc2626', icon: 'close-circle-outline', bg: 'rgba(220, 38, 38, 0.1)' },
  returned: { label: 'مسترجع', color: '#4b5563', icon: 'arrow-undo-circle-outline', bg: 'rgba(75, 85, 99, 0.1)' },
};

export const TrackOrderScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = async () => {
    if (!orderNumber.trim() || !phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الطلب ورقم الهاتف');
      return;
    }

    setLoading(true);
    setOrderData(null);
    try {
      const response: any = await apiClient.post('/orders/track', {
        orderNumber: orderNumber.trim(),
        phone: phone.trim()
      });

      if (response?.data?.data?.order) {
        setOrderData(response.data.data.order);
      } else if (response?.data?.order) {
        setOrderData(response.data.order);
      } else {
        Alert.alert('تنبيه', 'لم يتم العثور على الطلب. يرجى التأكد من رقم الطلب ورقم الهاتف.');
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل تتبع الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = orderData ? (STATUS_MAP[orderData.orderStatus] || STATUS_MAP.pending) : null;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Breadcrumbs items={[{ label: 'تتبع الطلب' }]} />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="search" size={28} color={Colors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>تتبع حالة طلبك</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          أدخل رقم الطلب ورقم الهاتف المسجل لمتابعة حالة الشحن
        </Text>
      </View>

      {/* Form Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>رقم الطلب</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={orderNumber}
            onChangeText={setOrderNumber}
            placeholder="مثال: ORD-123456"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="01xxxxxxxxx"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={[styles.searchBtn, { backgroundColor: Colors.primary }]}
          onPress={handleTrack}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.btnText}>تتبع الطلب</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {orderData && statusInfo && (
        <View style={styles.resultsContainer}>
          {/* Status Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>حالة الطلب</Text>
              <Text style={[styles.orderNumberText, { color: colors.textMuted }]}>{orderData.orderNumber}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Ionicons name={statusInfo.icon} size={28} color={statusInfo.color} />
              <View style={styles.statusInfoText}>
                <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                {orderData.maskedPhone && (
                  <Text style={[styles.maskedPhone, { color: colors.textMuted }]}>
                    الهاتف: {orderData.maskedPhone}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Items Card */}
          {orderData.items && orderData.items.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>المنتجات</Text>
              {orderData.items.map((item: any, idx: number) => (
                <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                  ) : null}
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.itemQty, { color: colors.textMuted }]}>الكمية: {item.quantity}</Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: Colors.primary }]}>
                    {item.price?.toFixed(2)} ج.م
                  </Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي النهائي:</Text>
                <Text style={[styles.totalValue, { color: Colors.primary }]}>
                  {orderData.total?.toFixed(2)} ج.م
                </Text>
              </View>
            </View>
          )}

          {/* Timeline */}
          {orderData.timeline && orderData.timeline.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 16 }]}>مسار الطلب</Text>
              {orderData.timeline.map((event: any, idx: number) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: idx === 0 ? Colors.primary : colors.border }]} />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStatus, { color: colors.text }]}>{event.status}</Text>
                    <Text style={[styles.timelineDate, { color: colors.textMuted }]}>{event.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  headerSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlign: 'right',
  },
  searchBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultsContainer: { marginTop: 4 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 17, fontWeight: 'bold' },
  orderNumberText: { fontSize: 13, fontFamily: 'monospace' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  statusInfoText: { flex: 1 },
  statusLabel: { fontSize: 17, fontWeight: 'bold' },
  maskedPhone: { fontSize: 13, marginTop: 2 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  itemImage: { width: 45, height: 45, borderRadius: 8 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemQty: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: 'bold' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 17, fontWeight: 'bold' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: '600' },
  timelineDate: { fontSize: 12, marginTop: 2 },
});

