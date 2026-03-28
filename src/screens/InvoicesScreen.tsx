import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { OrderService } from '../services/ProfileServices';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { AuthGuard } from '../components/AuthGuard';

export const InvoicesScreen = () => {
  const { colors } = useTheme();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useUser();

  const fetchInvoices = async () => {
    try {
      const data = await OrderService.getUserInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Fetch invoices error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return Colors.success;
      case 'in_progress':
      case 'pending': return Colors.primary;
      case 'canceled': return Colors.accent;
      default: return colors.textMuted;
    }
  };

  const mapStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'تم التسليم';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      case 'canceled': return 'تم الإلغاء';
      default: return status || 'غير معروف';
    }
  };

  if (!isAuthenticated) {
    return (
    <AuthGuard 
      title="لم تقم بعد بتسجيل الدخول" 
      subtitle="قم بتسجيل الدخول لعرض طلباتك"
    >
        <View />
      </AuthGuard>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={80} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>ليس لديك أي طلبات سابقة حتى الآن.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.orderId, { color: colors.text }]}>طلب #{item.orderId || item._id.substring(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{mapStatusText(item.status)}</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>الإجمالي: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.totalPrice} ج.م</Text></Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.supportBtn, { borderTopColor: colors.border }]}
              onPress={() => Linking.openURL('https://wa.me/201097645386')}
            >
              <Ionicons name="logo-whatsapp" size={18} color={Colors.success} />
              <Text style={styles.supportBtnText}>استفسار عن الطلب</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { borderRadius: 12, marginBottom: 16, borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  orderId: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, marginHorizontal: 16 },
  cardBody: { padding: 16, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, textAlign: 'left' },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderTopWidth: 1 },
  supportBtnText: { color: Colors.success, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 20, textAlign: 'center', fontSize: 16 },
});
