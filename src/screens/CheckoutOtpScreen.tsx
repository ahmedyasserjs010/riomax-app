import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import apiClient from '../api/apiClient';
import { Colors } from '../theme/colors';
import { storage } from '../utils/storage';
import { getGuestId, clearGuestId } from '../utils/guest';
import { OrderService } from '../services/ProfileServices';
import { PaymentService } from '../services/PaymentService';
import { safeOpenURL } from '../utils/textHelpers';
import { queryClient } from '../api/queryClient';
import { Ionicons } from '@expo/vector-icons';

const GUEST_FORM_KEY = 'riomax_guest_checkout_form';
const PENDING_ORDER_STORAGE_KEY = 'riomax_pending_order_id';

export const CheckoutOtpScreen = ({ route, navigation }: any) => {
  const { email: initialEmail } = route.params || {};
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { saveAuthData } = useUser();
  const { refreshCart } = useCart();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  // Resend OTP state
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const loadSavedForm = async () => {
      try {
        const saved = await storage.getItem(GUEST_FORM_KEY);
        if (saved) {
          setCheckoutData(JSON.parse(saved));
        } else {
          navigation.goBack();
        }
      } catch (e) {
        console.error('Failed to load guest checkout form:', e);
        navigation.goBack();
      }
    };
    loadSavedForm();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const targetEmail = checkoutData?.email || initialEmail || '';

  const maskEmail = (str: string) => {
    const [user, domain] = str.split('@');
    if (!user || !domain) return str;
    const masked = user.length <= 2
      ? user[0] + '***'
      : user[0] + '***' + user[user.length - 1];
    return `${masked}@${domain}`;
  };

  const handleResend = async () => {
    if (!canResend || !targetEmail) return;
    setResending(true);
    try {
      await apiClient.post('/auth/checkout-otp/send', { email: targetEmail });
      showToast('تم إعادة إرسال كود التحقق بنجاح', 'success');
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل إعادة إرسال الرمز');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال كود التحقق المكون من 6 أرقام');
      return;
    }

    if (!checkoutData) {
      Alert.alert('خطأ', 'بيانات الطلب غير متوفرة');
      return;
    }

    setLoading(true);
    try {
      const guestId = await getGuestId();

      // Step 1: Verify OTP and create/link account
      const verifyRes: any = await apiClient.post('/auth/checkout-otp/verify', {
        email: targetEmail,
        otp,
        name: checkoutData.name,
        phone: checkoutData.phone,
        governorate: checkoutData.governorate,
        city: checkoutData.city,
        address: checkoutData.address,
        guestId: guestId || undefined,
      });

      const creds = verifyRes?.data?.data?.newCredentials || verifyRes?.data?.newCredentials;
      if (creds?.accessToken && creds?.refreshToken) {
        await saveAuthData(creds.accessToken, creds.refreshToken);
        await clearGuestId();
      }

      // Step 2: Execute Order Placement
      const payload = {
        name: checkoutData.name,
        phone: checkoutData.phone,
        email: targetEmail,
        address: checkoutData.address,
        governorate: checkoutData.governorate,
        city: checkoutData.city,
        paymentMethod: checkoutData.paymentMethod,
        cart: checkoutData.cart,
        subtotal: checkoutData.subtotal,
        couponDiscount: checkoutData.couponDiscount,
        couponCode: checkoutData.couponCode,
        total: checkoutData.total,
        vat: checkoutData.vat,
        shippingCost: checkoutData.shippingCost,
      };

      // Online payment (Paymob)
      if (payload.paymentMethod === 'paymob_card' || payload.paymentMethod === 'paymob_wallet') {
        const paymentRes: any = await PaymentService.createPaymobIntention(payload);
        const intentData = paymentRes?.data?.checkoutUrl 
          ? paymentRes.data 
          : (paymentRes?.checkoutUrl ? paymentRes : (paymentRes?.data?.data?.checkoutUrl ? paymentRes.data.data : null));

        if (intentData?.checkoutUrl) {
          if (intentData.orderId) {
            await storage.setItem(PENDING_ORDER_STORAGE_KEY, intentData.orderId);
          }
          await storage.deleteItem(GUEST_FORM_KEY);
          showToast('تم التحقق بنجاح! جاري تحويلك للدفع...', 'success');
          // Open Paymob checkout in external browser or Webview
          await safeOpenURL(intentData.checkoutUrl);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
          return;
        }
      }

      // Offline payment (COD, InstaPay, Vodafone Cash)
      await OrderService.createOrder(payload);

      try {
        await refreshCart();
      } catch (e) {}

      // Open WhatsApp with order details
      const adminWhatsApp = '201097645386';
      let message = `*طلب جديد من متجر Riomax*\n\n`;
      message += `*البيانات الشخصية:*\n`;
      message += `- الاسم: ${payload.name}\n`;
      message += `- رقم الهاتف: ${payload.phone}\n`;
      message += `- المحافظة: ${payload.governorate}\n`;
      message += `- المدينة: ${payload.city}\n`;
      message += `- العنوان التفصيلي: ${payload.address}\n\n`;

      let paymentStr = '';
      switch (payload.paymentMethod) {
        case 'cash_on_delivery': paymentStr = 'الدفع عند الاستلام (COD)'; break;
        case 'instapay': paymentStr = 'إنستا باي (InstaPay)'; break;
        case 'vodafone_cash': paymentStr = 'فودافون كاش (Vodafone Cash)'; break;
        default: paymentStr = payload.paymentMethod;
      }
      message += `*طريقة الدفع:* ${paymentStr}\n`;
      message += `*حالة الدفع:* قيد المراجعة ⏳\n\n`;

      message += `*المنتجات المرفقة (*${payload.cart?.items?.length || 0}*):*\n`;
      if (payload.cart?.items) {
        payload.cart.items.forEach((item: any, idx: number) => {
          const product = item.Products;
          const price = product?.priceAfterDiscount || product?.price || 0;
          message += `${idx + 1}. ${product?.name} (الكمية: ${item.quantity}) - السعر: ${price} ج.م\n`;
        });
      }
      message += `\n*تفاصيل الفاتورة:*\n`;
      message += `- المجموع الفرعي: ${payload.subtotal.toFixed(2)} ج.م\n`;
      if (payload.vat) message += `- ضريبة القيمة المضافة: ${payload.vat.toFixed(2)} ج.م\n`;
      message += `- مصاريف شحن مبدئية: 75 ج.م\n`;
      if (payload.couponDiscount > 0) message += `- خصم الكوبون: -${payload.couponDiscount.toFixed(2)} ج.م\n`;
      message += `- الإجمالي النهائي: *${payload.total.toFixed(2)} ج.م*\n\n`;

      const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
      await safeOpenURL(whatsappUrl);

      await storage.deleteItem(GUEST_FORM_KEY);
      showToast('تم تأكيد الطلب بنجاح!', 'success');

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'Profile',
              params: {
                screen: 'Invoices'
              }
            }
          }
        ],
      });

    } catch (err: any) {
      console.error('Checkout OTP verify error:', err);
      Alert.alert('خطأ', err.message || 'فشل التحقق من الكود أو إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={40} color="#fff" />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>تأكيد البريد الإلكتروني</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          تم إرسال كود التحقق إلى بريدك الإلكتروني. من فضلك افتح صندوق الوارد (Inbox) الخاص بالبريد الذي أدخلته، وتحقق من الرسالة، ثم أدخل الكود لإكمال عملية الشراء.
        </Text>
      </View>

      {targetEmail ? (
        <View style={styles.emailBadge}>
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={[styles.emailText, { color: colors.text }]}>{maskEmail(targetEmail)}</Text>
        </View>
      ) : null}

      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput 
          style={[styles.input, { color: colors.text }]}
          value={otp}
          onChangeText={(val) => setOtp(val.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
        />
      </View>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: Colors.primary }]}
        onPress={handleVerify}
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>تأكيد وإتمام الطلب</Text>
        )}
      </TouchableOpacity>

      {/* Resend & Edit buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.resendBtn} 
          onPress={handleResend}
          disabled={!canResend || resending}
        >
          {resending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : canResend ? (
            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>إعادة إرسال الرمز</Text>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              إعادة الإرسال بعد <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{countdown}</Text> ثانية
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginRight: 4 }}>تعديل البيانات</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: 'center',
    alignItems: 'center' 
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    color: '#2563eb',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputWrapper: { 
    borderWidth: 1, 
    borderRadius: 14, 
    height: 65, 
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  input: { 
    fontSize: 32, 
    fontWeight: 'bold',
    letterSpacing: 12,
  },
  btn: { 
    height: 55, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
  bottomActions: {
    marginTop: 24,
    alignItems: 'center',
    gap: 14,
  },
  resendBtn: { 
    padding: 8, 
    alignItems: 'center' 
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
});

