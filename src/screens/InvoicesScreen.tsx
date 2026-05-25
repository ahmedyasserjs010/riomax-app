import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { OrderService } from '../services/ProfileServices';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { AuthGuard } from '../components/AuthGuard';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

export const InvoicesScreen = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useUser();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
      case 'shipped': return Colors.info;
      case 'processing':
      case 'received':
      case 'confirmed': return Colors.primary;
      case 'pending': return Colors.warning;
      case 'cancelled':
      case 'canceled': return Colors.accent;
      default: return colors.textMuted;
    }
  };

  const mapStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'تم التسليم';
      case 'shipped': return 'جاري التوصيل';
      case 'processing': return 'جاري التجهيز';
      case 'received': return 'تم الاستقبال';
      case 'confirmed': return 'تم التأكيد';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled':
      case 'canceled': return 'تم الإلغاء';
      default: return status || 'غير معروف';
    }
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId) {
      showToast('مُعرّف الطلب غير موجود أو غير صالح', 'error');
      return;
    }

    Alert.alert(
      'تأكيد الإزالة',
      'هل تريد إزالة هذا الطلب من قائمة فواتيرك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إزالة من القائمة', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await OrderService.deleteOrder(orderId);
              showToast('تمت إزالة الفاتورة بنجاح', 'success');
              fetchInvoices();
            } catch (err: any) {
              console.error('[InvoicesScreen] Delete error:', err);
              showToast(err.message || 'فشل إزالة الفاتورة', 'error');
            }
          }
        }
      ]
    );
  };

  const generateInvoicePDF = async (order: any) => {
    const productsHtml = order.items?.map((item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.productName || item.product?.name || 'منتج'}</td>
        <td>${item.quantity || 1}</td>
        <td>${(item.price || 0).toLocaleString()} ج.م</td>
        <td>${((item.price || 0) * (item.quantity || 1)).toLocaleString()} ج.م</td>
      </tr>
    `).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة طلب #${order.orderNumber || order.id?.substring(0, 8)}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; }
          .header h1 { color: #ff6b00; margin: 0 0 10px 0; }
          .details-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details-section div { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th, td { border: 1px solid #eee; padding: 12px; text-align: right; }
          th { background-color: #f9f9f9; color: #666; font-weight: bold; }
          .summary { border-top: 2px solid #eee; padding-top: 20px; width: 50%; margin-left: 0; margin-right: auto; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .summary-row.total { font-weight: bold; font-size: 18px; color: #ff6b00; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 50px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RioMax Store</h1>
          <p>فاتورة شراء ضريبية مبسطة</p>
        </div>

        <div class="details-section">
          <div style="text-align: right;">
            <strong>بيانات العميل:</strong><br>
            الاسم: ${order.user?.name || order.user?.firstName || 'عميل'}<br>
            الهاتف: ${order.phone || order.shippingAddress?.phone || ''}<br>
            المحافظة: ${order.governorate || order.shippingAddress?.governorate || ''}<br>
            العنوان: ${order.address || order.shippingAddress?.address || ''}
          </div>
          <div style="text-align: left;">
            <strong>تفاصيل الطلب:</strong><br>
            رقم الطلب: #${order.orderNumber || order.id?.substring(0, 8)}<br>
            التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG')}<br>
            طريقة الدفع: ${order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.paymentMethod}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>المجموع الفرعي:</span>
            <span>${(order.subtotal || order.total || 0).toLocaleString()} ج.م</span>
          </div>
          <div class="summary-row">
            <span>مصاريف الشحن:</span>
            <span>${(order.shippingCost || 75).toLocaleString()} ج.م</span>
          </div>
          ${order.vatPercentage > 0 ? `
          <div class="summary-row">
            <span>ضريبة القيمة المضافة (${order.vatPercentage}%):</span>
            <span>${(order.vatAmount || 0).toLocaleString()} ج.م</span>
          </div>
          ` : ''}
          ${order.couponDiscount > 0 ? `
          <div class="summary-row" style="color: #4caf50;">
            <span>خصم الكوبون:</span>
            <span>-${(order.couponDiscount || 0).toLocaleString()} ج.م</span>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span>الإجمالي الكلي:</span>
            <span>${(order.total || 0).toLocaleString()} ج.م</span>
          </div>
        </div>

        <div class="footer">
          شكراً لتسوقكم معنا من متجر ريوماكس!
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('خطأ', 'فشل توليد أو مشاركة ملف الفاتورة');
    }
  };

  const renderTimeline = (status: string) => {
    const steps = [
      { id: 'pending', label: 'قيد الانتظار', icon: 'time-outline' },
      { id: 'confirmed', label: 'تم التأكيد', icon: 'checkbox-outline' },
      { id: 'shipped', label: 'جاري الشحن', icon: 'boat-outline' },
      { id: 'delivered', label: 'تم التسليم', icon: 'home-outline' }
    ];

    if (status?.toLowerCase() === 'cancelled' || status?.toLowerCase() === 'canceled') {
      return (
        <View style={[styles.canceledTimeline, { backgroundColor: Colors.accent + '15' }]}>
          <Ionicons name="close-circle" size={22} color={Colors.accent} />
          <Text style={[styles.canceledText, { color: Colors.accent }]}>تم إلغاء هذا الطلب</Text>
        </View>
      );
    }

    const statusMap: Record<string, number> = {
      'pending': 0,
      'confirmed': 1,
      'received': 1,
      'processing': 1,
      'shipped': 2,
      'delivered': 3
    };

    const currentStepIndex = statusMap[status?.toLowerCase()] ?? 0;

    return (
      <View style={styles.timelineWrapper}>
        <View style={styles.timelineContainer}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <View key={step.id} style={styles.timelineStep}>
                <View style={styles.stepIconContainer}>
                  <View style={[
                    styles.stepIconCircle, 
                    { 
                      borderColor: isCompleted ? Colors.primary : colors.border,
                      backgroundColor: isActive ? Colors.primary : isCompleted ? Colors.primary + '20' : colors.background
                    }
                  ]}>
                    <Ionicons 
                      name={step.icon as any} 
                      size={12} 
                      color={isActive ? '#fff' : isCompleted ? Colors.primary : colors.textMuted} 
                    />
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[
                      styles.stepLine, 
                      { backgroundColor: idx < currentStepIndex ? Colors.primary : colors.border }
                    ]} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel, 
                  { 
                    color: isActive ? Colors.primary : isCompleted ? colors.text : colors.textMuted,
                    fontWeight: isActive ? 'bold' : 'normal'
                  }
                ]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderExpandedDetails = (item: any) => {
    return (
      <View style={[styles.expandedContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitleDetail, { color: colors.text }]}>حالة ومسار الطلب</Text>
        {renderTimeline(item.status)}

        <Text style={[styles.sectionTitleDetail, { color: colors.text, marginTop: 16 }]}>تفاصيل المنتجات</Text>
        <View style={[styles.productsWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {item.items?.map((cartItem: any, idx: number) => {
            const price = cartItem.price || 0;
            return (
              <View key={idx} style={[styles.productRow, idx < item.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.8 }]}>
                <View style={styles.productInfoLeft}>
                  <Text style={[styles.productPriceText, { color: Colors.primary }]}>{(price * (cartItem.quantity || 1)).toLocaleString()} ج.م</Text>
                </View>
                <View style={styles.productInfoRight}>
                  <Text style={[styles.productNameText, { color: colors.text }]} numberOfLines={1}>{cartItem.productName || 'منتج'}</Text>
                  <Text style={[styles.productQtyText, { color: colors.textMuted }]}>الكمية: {cartItem.quantity || 1}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionTitleDetail, { color: colors.text, marginTop: 16 }]}>بيانات التوصيل</Text>
        <View style={[styles.deliveryInfoWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.deliveryRow}>
            <Text style={[styles.deliveryValue, { color: colors.text }]}>{item.customerName || item.user?.name || 'غير متوفر'}</Text>
            <Text style={[styles.deliveryLabel, { color: colors.textMuted }]}>الاسم:</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={[styles.deliveryValue, { color: colors.text }]}>{item.customerPhone || item.phone || 'غير متوفر'}</Text>
            <Text style={[styles.deliveryLabel, { color: colors.textMuted }]}>الهاتف:</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={[styles.deliveryValue, { color: colors.text }]}>{item.governorate || 'غير متوفر'}</Text>
            <Text style={[styles.deliveryLabel, { color: colors.textMuted }]}>المحافظة:</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={[styles.deliveryValue, { color: colors.text }]} numberOfLines={2}>{item.customerAddress || item.address || 'غير متوفر'}</Text>
            <Text style={[styles.deliveryLabel, { color: colors.textMuted }]}>العنوان:</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitleDetail, { color: colors.text, marginTop: 16 }]}>تفاصيل الفاتورة</Text>
        <View style={[styles.financialSummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{(item.subtotal || item.total || 0).toLocaleString()} ج.م</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>المجموع الفرعي:</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>+{(item.shippingCost || 75).toLocaleString()} ج.م</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>الشحن:</Text>
          </View>
          {item.vatPercentage > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{(item.vatAmount || 0).toLocaleString()} ج.م</Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>ضريبة القيمة المضافة ({item.vatPercentage}%):</Text>
            </View>
          )}
          {item.couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>-{(item.couponDiscount || 0).toLocaleString()} ج.م</Text>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>خصم الكوبون:</Text>
            </View>
          )}
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalAmountValue, { color: Colors.primary }]}>{(item.total || 0).toLocaleString()} ج.م</Text>
            <Text style={[styles.totalAmountLabel, { color: colors.text }]}>الإجمالي الكلي:</Text>
          </View>

          <View style={[styles.paymentMethodWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="card-outline" size={16} color={Colors.primary} />
            <Text style={[styles.paymentMethodText, { color: colors.text }]}>
              طريقة الدفع: {
                item.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 
                item.paymentMethod === 'visa' ? 'فيزا / محافظ إلكترونية' :
                item.paymentMethod === 'instapay' ? 'إنستاباي' :
                'فودافون كاش'
              }
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.printBtn]}
            onPress={() => generateInvoicePDF(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="print-outline" size={18} color="#fff" />
            <Text style={styles.printBtnText}>تحميل / طباعة الفاتورة PDF</Text>
          </TouchableOpacity>

          {(item.status?.toLowerCase() === 'delivered' || item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'canceled') && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn, { borderColor: Colors.accent }]}
              onPress={() => handleDeleteOrder(item.id || item._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.accent} />
              <Text style={[styles.deleteBtnText, { color: Colors.accent }]}>إزالة من القائمة</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="receipt-outline" size={54} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد فواتير بعد</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              لم تقم بإجراء أي طلبات حتى الآن. يمكنك استكشاف منتجاتنا المميزة والبدء بالتسوق الفوري.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedOrderId === (item.id || item._id);
          const badgeColor = getStatusColor(item.status);
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity 
                onPress={() => toggleExpand(item.id || item._id)} 
                activeOpacity={0.9}
                style={styles.cardHeaderPressable}
              >
                <View style={styles.cardHeaderTop}>
                  <View style={styles.invoiceNumberContainer}>
                    <Text style={[styles.orderId, { color: colors.text }]}>طلب #{item.orderNumber || item.id?.substring(0, 8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badgeColor + '12', borderColor: badgeColor + '40' }]}>
                    <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
                    <Text style={[styles.statusText, { color: badgeColor }]}>{mapStatusText(item.status)}</Text>
                  </View>
                </View>
                
                <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />
                
                <View style={styles.cardBodyBrief}>
                  <View style={styles.briefInfoRow}>
                    <Text style={[styles.briefValue, { color: colors.text }]}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
                    <View style={styles.briefLabelContainer}>
                      <Text style={[styles.briefLabel, { color: colors.textMuted }]}>تاريخ الطلب</Text>
                      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
                    </View>
                  </View>

                  <View style={styles.briefInfoRow}>
                    <Text style={[styles.briefValue, { color: Colors.primary, fontWeight: 'bold' }]}>{(item.total || 0).toLocaleString()} ج.م</Text>
                    <View style={styles.briefLabelContainer}>
                      <Text style={[styles.briefLabel, { color: colors.textMuted }]}>إجمالي الفاتورة</Text>
                      <Ionicons name="wallet-outline" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                </View>

                <View style={styles.expandChevronContainer}>
                  <Text style={[styles.expandText, { color: colors.textMuted }]}>
                    {isExpanded ? 'عرض تفاصيل أقل' : 'عرض كامل التفاصيل'}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={Colors.primary} 
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && renderExpandedDetails(item)}

              {!isExpanded && (
                <TouchableOpacity 
                  style={[styles.supportBtn, { borderTopColor: colors.border }]}
                  onPress={() => Linking.openURL('https://wa.me/201097645386')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={16} color={Colors.success} style={{ marginLeft: 6 }} />
                  <Text style={styles.supportBtnText}>استفسار أو دعم للطلب عبر الواتساب</Text>
                </TouchableOpacity>
              )}
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
  list: { padding: 14, paddingBottom: 30 },
  
  // Premium Card styles
  card: { 
    borderRadius: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      }
    })
  },
  cardHeaderPressable: {
    padding: 16,
  },
  cardHeaderTop: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  invoiceNumberContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  orderId: { fontSize: 16, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' },
  statusBadge: { 
    flexDirection: 'row-reverse',
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 30,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  headerDivider: { 
    height: 1, 
    marginVertical: 12,
  },
  cardBodyBrief: { 
    flexDirection: 'column', 
    gap: 8,
  },
  briefInfoRow: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  briefLabelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  briefLabel: { fontSize: 13 },
  briefValue: { fontSize: 13, fontWeight: '500' },
  
  expandChevronContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  expandText: {
    fontSize: 12,
    fontWeight: '500',
  },

  supportBtn: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 12, 
    borderTopWidth: 1,
  },
  supportBtnText: { color: Colors.success, fontWeight: '700', fontSize: 12 },
  
  // Empty State styles
  empty: { flex: 1, alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      }
    })
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Expanded Container styles
  expandedContainer: {
    padding: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitleDetail: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'right',
  },
  
  // Products wrapper styles
  productsWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  productInfoRight: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 4,
  },
  productInfoLeft: {
    alignItems: 'flex-end',
  },
  productNameText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
  },
  productQtyText: {
    fontSize: 11,
  },
  productPriceText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Delivery Info styles
  deliveryInfoWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  deliveryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryValue: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
  },

  // Financial summary styles
  financialSummary: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  dividerLine: {
    height: 1,
    marginVertical: 4,
  },
  totalAmountLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalAmountValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  paymentMethodWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },

  // Actions styles
  actionsContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  printBtn: {
    backgroundColor: Colors.primary,
  },
  printBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    borderWidth: 1,
  },
  deleteBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },

  // Timeline styles
  timelineWrapper: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  timelineContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: 20,
    justifyContent: 'center',
  },
  stepIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepLine: {
    height: 1.5,
    position: 'absolute',
    left: '50%',
    width: '100%',
    top: 9,
    zIndex: 1,
  },
  stepLabel: {
    fontSize: 9,
    marginTop: 5,
    textAlign: 'center',
  },
  canceledTimeline: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  canceledText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
