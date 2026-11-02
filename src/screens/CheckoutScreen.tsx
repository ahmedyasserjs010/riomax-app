import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { OrderService, UserService } from '../services/ProfileServices';
import { CouponService } from '../services/CouponService';
import { PaymentService } from '../services/PaymentService';
import { PublicService } from '../services/PublicService';
import { storage } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { IProduct } from '../types';

const PENDING_ORDER_STORAGE_KEY = 'riomax_pending_order_id';
const SHIPPING_INFO_STORAGE_KEY = 'riomax_shipping_info';

export const CheckoutScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { cartItems, refreshCart, cartCount } = useCart();
  const { userData, fullProfile, refreshProfile } = useUser();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: fullProfile?.name || userData?.name || '',
    phone: fullProfile?.phone || '',
    governorate: fullProfile?.governorate || '',
    city: fullProfile?.city || '',
    address: fullProfile?.address || '',
    paymentMethod: 'cash_on_delivery'
  });

  // Settings & VAT
  const [vatConfig, setVatConfig] = useState({ enabled: false, percentage: 14 });

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // WebView for Paymob
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'pending' | 'cancelled' | 'failed' | 'unavailable' | null>(null);

  // Terms
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  // 1. Fetch fresh profile from database on mount & load cached shipping details
  React.useEffect(() => {
    refreshProfile();

    const loadCachedShipping = async () => {
      try {
        const cached = await storage.getItem(SHIPPING_INFO_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setFormData(prev => ({
            ...prev,
            name: prev.name || parsed.name || '',
            phone: prev.phone || parsed.phone || '',
            governorate: prev.governorate || parsed.governorate || '',
            city: prev.city || parsed.city || '',
            address: prev.address || parsed.address || '',
          }));
        }
      } catch (err) {
        console.warn('Failed to load cached shipping info:', err);
      }
    };
    loadCachedShipping();
  }, []);

  // 2. Sync user details to form when fullProfile loads or updates from server
  React.useEffect(() => {
    if (fullProfile) {
      setFormData(prev => ({
        ...prev,
        name: fullProfile.name || prev.name || userData?.name || '',
        phone: fullProfile.phone || prev.phone || '',
        governorate: fullProfile.governorate || prev.governorate || '',
        city: fullProfile.city || prev.city || '',
        address: fullProfile.address || prev.address || '',
      }));
    }
  }, [fullProfile]);

  // Helper to persist shipping details locally and update backend user profile
  const syncAndSaveProfile = async (currentData: typeof formData) => {
    // Save to local storage for instant prefill next time
    try {
      await storage.setItem(SHIPPING_INFO_STORAGE_KEY, JSON.stringify({
        name: currentData.name.trim(),
        phone: currentData.phone.trim(),
        governorate: currentData.governorate.trim(),
        city: currentData.city.trim(),
        address: currentData.address.trim(),
      }));
    } catch (e) {
      console.warn('Failed to cache shipping info in local storage:', e);
    }

    // Auto-save to user profile in backend database (matching website CheckoutClientPage.tsx)
    try {
      const updatePayload: any = {};
      if (currentData.name?.trim() && currentData.name.trim() !== fullProfile?.name) {
        updatePayload.name = currentData.name.trim();
      }
      if (currentData.phone?.trim() && currentData.phone.trim() !== fullProfile?.phone) {
        updatePayload.phone = currentData.phone.trim();
      }
      if (currentData.governorate?.trim() && currentData.governorate.trim() !== fullProfile?.governorate) {
        updatePayload.governorate = currentData.governorate.trim();
      }
      if (currentData.city?.trim() && currentData.city.trim() !== fullProfile?.city) {
        updatePayload.city = currentData.city.trim();
      }
      if (currentData.address?.trim() && currentData.address.trim() !== fullProfile?.address) {
        updatePayload.address = currentData.address.trim();
      }

      if (Object.keys(updatePayload).length > 0) {
        await UserService.updateProfile(updatePayload);
        refreshProfile();
      }
    } catch (profileErr) {
      console.warn('Auto-save profile details error:', profileErr);
    }
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await PublicService.getGeneralSettings();
        if (settings) {
          setVatConfig({
            enabled: settings.vatEnabled,
            percentage: settings.vatPercentage || 14
          });
        }
      } catch (err) {
        console.error('Error fetching settings in Checkout:', err);
      }
    };
    fetchSettings();
  }, []);

  // Recovery Flow: check if there is an uncompleted payment when screen opens
  React.useEffect(() => {
    let isMounted = true;
    const checkPendingRecovery = async () => {
      try {
        const pendingId = await storage.getItem(PENDING_ORDER_STORAGE_KEY);
        if (pendingId) {
          const res = await PaymentService.verifyPaymentStatus(pendingId);
          if (res?.data) {
            if (res.data.status === 'paid') {
              await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
              await refreshCart();
              if (isMounted) {
                Alert.alert(
                  'تم الدفع بنجاح!',
                  `تم استلام وتأكيد دفع طلبك (${res.data.orderNumber || ''}) بنجاح.`,
                  [
                    { text: 'عرض الفاتورة', onPress: () => finishCheckout() }
                  ]
                );
              }
            } else if (res.data.status === 'failed') {
              await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Recovery check error:', err);
      }
    };

    checkPendingRecovery();
    return () => { isMounted = false; };
  }, []);

  const subtotal = cartItems.reduce((acc, item) => {
    const product = item.Products as IProduct;
    if (!product) return acc;
    const price = product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;
    return acc + (price * item.quantity);
  }, 0);

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'percent'
      ? (subtotal * appliedCoupon.discountValue) / 100
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;

  const shipping = 75; // Initial shipping cost
  const vat = vatConfig.enabled ? (subtotal * vatConfig.percentage) / 100 : 0;
  const total = subtotal + shipping + vat - couponDiscount;

  // Auto-switch payment method if total exceeds 500 EGP
  React.useEffect(() => {
    if (total > 500 && formData.paymentMethod === 'cash_on_delivery') {
      setFormData(prev => ({ ...prev, paymentMethod: 'paymob_card' }));
      Alert.alert('تنبيه', 'الدفع عند الاستلام متاح للطلبات حتى 500 ج.م فقط. تم تحويل طريقة الدفع إلى بطاقة بنكية.');
    }
  }, [total, formData.paymentMethod]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await CouponService.validateCoupon(couponCode);
      if (res) {
        setAppliedCoupon(res);
        showToast('تم تطبيق الكوبون بنجاح', 'success');
      } else {
        setCouponError('الكوبون غير صالح');
        showToast('الكوبون غير صالح', 'error');
      }
    } catch (err: any) {
      setCouponError(err.message || 'الكوبون غير صالح');
      showToast(err.message || 'الكوبون غير صالح', 'error');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    showToast('تم إزالة الكوبون', 'info');
  };

  const handlePlaceOrder = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.governorate.trim() || !formData.city.trim()) {
      Alert.alert('خطأ', 'يرجى إكمال جميع البيانات المطلوبة بما فيها المحافظة والمدينة / المركز');
      return;
    }

    if (!acceptPolicy) {
      Alert.alert('خطأ', 'يجب الموافقة على سياسة الاستبدال والاسترجاع أولاً.');
      return;
    }

    setLoading(true);
    try {
      // Auto-save shipping info to storage and user profile in database
      await syncAndSaveProfile(formData);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        governorate: formData.governorate.trim(),
        city: formData.city.trim(),
        paymentMethod: formData.paymentMethod as any,
        cart: {
          items: cartItems.map(item => {
            const prod = item.Products;
            const productId = typeof prod === 'object' && prod !== null ? (prod._id || prod.id) : prod;
            return {
              _id: item._id,
              productId,
              Products: item.Products,
              quantity: item.quantity
            };
          })
        },
        subtotal,
        couponDiscount,
        couponCode: appliedCoupon ? couponCode : undefined,
        total,
        vat,
        shippingCost: shipping
      };

      // Online Payment with Paymob
      if (formData.paymentMethod === 'paymob_card' || formData.paymentMethod === 'paymob_wallet') {
        const response: any = await PaymentService.createPaymobIntention(payload);
        const intentData = response?.data?.checkoutUrl 
          ? response.data 
          : (response?.checkoutUrl 
            ? response 
            : (response?.data?.data?.checkoutUrl ? response.data.data : null));

        if (intentData?.checkoutUrl) {
          const newOrderId = intentData.orderId;
          const newOrderNumber = intentData.orderNumber;
          setCurrentOrderId(newOrderId);
          setCurrentOrderNumber(newOrderNumber);
          if (newOrderId) {
            await storage.setItem(PENDING_ORDER_STORAGE_KEY, newOrderId);
          }
          setCheckoutUrl(intentData.checkoutUrl);
          setShowWebView(true);
          return;
        } else {
          throw new Error(response?.message || 'لم نتمكن من الحصول على رابط الدفع الإلكتروني');
        }
      }

      // Normal Offline flow
      await OrderService.createOrder(payload);

      // Refresh cart immediately after success
      try {
        await refreshCart();
      } catch (cartErr) {
        console.error('Failed to refresh cart:', cartErr);
      }



      // Build WhatsApp message matching Web Frontend exactly
      const adminWhatsApp = '201097645386';
      let message = `*طلب جديد من متجر Riomax*%0a%0a`;

      message += `*البيانات الشخصية:*%0a`;
      message += `- الاسم: ${payload.name}%0a`;
      message += `- رقم الهاتف: ${payload.phone}%0a`;
      message += `- المحافظة: ${payload.governorate}%0a`;
      message += `- المدينة: ${payload.city}%0a`;
      message += `- العنوان التفصيلي: ${payload.address}%0a%0a`;

      // Payment method Arabic translation (matching web frontend)
      let paymentStr = '';
      let statusStr = 'قيد المراجعة ⏳';
      switch (payload.paymentMethod) {
        case 'cash_on_delivery':
          paymentStr = 'الدفع عند الاستلام (COD)';
          statusStr = 'لم يتم الدفع';
          break;
        case 'instapay':
          paymentStr = 'إنستا باي (InstaPay)';
          statusStr = 'جاري تأكيد الدفع ⏳';
          break;
        case 'vodafone_cash':
          paymentStr = 'فودافون كاش (Vodafone Cash)';
          statusStr = 'جاري تأكيد الدفع ⏳';
          break;
        default:
          paymentStr = payload.paymentMethod;
      }

      message += `*طريقة الدفع:* ${paymentStr}%0a`;
      message += `*حالة الدفع:* ${statusStr}%0a%0a`;

      // Product list (matching web frontend)
      message += `*المنتجات المرفقة (*${payload.cart?.items?.length || 0}*):*%0a`;
      if (payload.cart?.items) {
        payload.cart.items.forEach((item: any, index: number) => {
          const product = item.Products;
          const price = product?.priceAfterDiscount || product?.price || 0;
          message += `${index + 1}. ${product?.name} (الكمية: ${item.quantity}) - السعر: ${price} ج.م%0a`;
        });
      }
      message += `%0a`;

      message += `*تفاصيل الفاتورة:*%0a`;
      message += `- المجموع الفرعي: ${payload.subtotal.toFixed(2)} ج.م%0a`;
      if (payload.vat) {
        message += `- ضريبة القيمة المضافة: ${payload.vat.toFixed(2)} ج.م%0a`;
      }
      message += `- مصاريف شحن مبدئية: 75 ج.م%0a`;
      if (payload.couponDiscount > 0) {
        message += `- خصم الكوبون: -${payload.couponDiscount.toFixed(2)} ج.م%0a`;
      }
      message += `- الإجمالي النهائي: *${payload.total.toFixed(2)} ج.م*%0a`;
      message += `%0a*(ملاحظة: سعر الشحن قد يتم تعديله حسب الموقع)*%0a`;

      // Open WhatsApp automatically (matching web frontend behavior)
      Linking.openURL(`https://wa.me/${adminWhatsApp}?text=${message}`);

      showToast('تم إجراء الفاتورة بنجاح!', 'success');
      // Navigate to Invoices page (matching web: router.push('/userInvoices'))
      finishCheckout();
    } catch (err: any) {
      showToast(err.message || 'فشل في إتمام الطلب', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOrderPayment = async (orderId: string, urlPending = false, urlSuccess = false) => {
    setIsVerifyingPayment(true);
    let verified = false;

    // Retry verification up to 3 times to accommodate webhook latency
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await PaymentService.verifyPaymentStatus(orderId);
        if (res?.data) {
          if (res.data.orderNumber) {
            setCurrentOrderNumber(res.data.orderNumber);
          }

          if (res.data.status === 'paid') {
            await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
            await refreshCart();
            setPaymentResult('success');
            verified = true;
            break;
          } else if (res.data.status === 'failed') {
            await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
            await refreshCart();
            setPaymentResult('failed');
            verified = true;
            break;
          } else if (res.data.status === 'pending_payment') {
            // If URL explicitly indicates failure, break as failed
            if (!urlSuccess && !urlPending) {
              await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
              await refreshCart();
              setPaymentResult('failed');
              verified = true;
              break;
            }
            if (attempt < 2) {
              await new Promise(r => setTimeout(r, 1500));
            }
          }
        }
      } catch (err) {
        console.error(`Verification attempt ${attempt + 1} error:`, err);
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    setIsVerifyingPayment(false);

    if (!verified) {
      if (urlPending) {
        setPaymentResult('pending');
      } else if (urlSuccess) {
        setPaymentResult('pending');
      } else {
        setPaymentResult('unavailable');
      }
    }
  };

  const handleWebViewNavigationStateChange = async (newNavState: any) => {
    const { url } = newNavState;
    if (!url) return;

    // Validate exact callback origin and path
    let isPaymentResult = false;
    try {
      const parsedUrl = new URL(url);
      const validOrigins = [
        'https://riomax.com.eg',
        'https://www.riomax.com.eg',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      const hasValidOrigin = validOrigins.includes(parsedUrl.origin) || parsedUrl.hostname.includes('riomax.com.eg');
      const hasValidPath = parsedUrl.pathname === '/payment-result' || parsedUrl.pathname.startsWith('/payment-result');
      if (hasValidOrigin && hasValidPath) {
        isPaymentResult = true;
      }
    } catch {
      if (/^https?:\/\/(?:www\.)?riomax\.com\.eg\/payment-result/i.test(url)) {
        isPaymentResult = true;
      }
    }

    if (isPaymentResult) {
      setShowWebView(false);
      setCheckoutUrl('');

      const getParam = (name: string) => {
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results || !results[2]) return null;
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
      };

      const success = getParam('success');
      const pending = getParam('pending');

      const orderIdToVerify = currentOrderId || (await storage.getItem(PENDING_ORDER_STORAGE_KEY));

      if (orderIdToVerify) {
        await verifyOrderPayment(orderIdToVerify, pending === 'true', success === 'true');
      } else {
        if (success === 'true' && pending === 'false') {
          await refreshCart();
          setPaymentResult('success');
        } else if (pending === 'true') {
          setPaymentResult('pending');
        } else {
          await refreshCart();
          setPaymentResult('failed');
        }
      }
    }
  };

  const finishCheckout = () => {
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
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل تريد إلغاء عملية الدفع؟ ستظل جميع منتجاتك محفوظة بالكامل داخل سلتك.',
      [
        { text: 'الاستمرار في الدفع', style: 'cancel' },
        { 
          text: 'نعم، إلغاء', 
          style: 'destructive', 
          onPress: async () => {
            setShowWebView(false);
            setCheckoutUrl('');
            const orderIdToCancel = currentOrderId || (await storage.getItem(PENDING_ORDER_STORAGE_KEY));
            if (orderIdToCancel) {
              try {
                await PaymentService.cancelPayment(orderIdToCancel);
              } catch (e) {
                console.error('Cancel payment error:', e);
              }
              await storage.deleteItem(PENDING_ORDER_STORAGE_KEY);
            }
            // Preserve cart; do NOT refreshCart here.
            setPaymentResult('cancelled');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>معلومات الشحن</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>الاسم الكامل</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="الاسم"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
            placeholder="01xxxxxxxxx"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>المحافظة *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={formData.governorate}
            onChangeText={(text) => setFormData({...formData, governorate: text})}
            placeholder="مثلاً: القاهرة أو الجيزة..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>المدينة / المركز *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={formData.city}
            onChangeText={(text) => setFormData({...formData, city: text})}
            placeholder="المدينة أو المركز"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>العنوان بالتفصيل</Text>
          <TextInput 
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
            multiline
            numberOfLines={3}
            placeholder="الشارع، رقم المنزل، علامة مميزة..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Coupons section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>كوبون الخصم</Text>
        {appliedCoupon ? (
          <View style={[styles.appliedCouponBox, { backgroundColor: colors.card, borderColor: Colors.success }]}>
            <Text style={[styles.appliedCouponText, { color: Colors.success }]}>
              تم تطبيق الكوبون: {appliedCoupon.code} (خصم {appliedCoupon.discountValue}{appliedCoupon.discountType === 'percent' ? '%' : ' ج.م'})
            </Text>
            <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
              <Ionicons name="close-circle" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponSection}>
            <TextInput 
              style={[styles.couponInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="لو معك كوبون خصم قم بادخله"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={[styles.couponBtn, { backgroundColor: Colors.primary }]}
              onPress={handleValidateCoupon}
              disabled={isValidatingCoupon}
            >
              {isValidatingCoupon ? <ActivityIndicator color="#fff" /> : <Text style={styles.couponBtnText}>تطبيق</Text>}
            </TouchableOpacity>
          </View>
        )}
        {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>طريقة الدفع</Text>
        
        <View style={styles.paymentOptionsList}>
          <TouchableOpacity 
            style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'cash_on_delivery' ? Colors.primary : colors.border }]}
            onPress={() => setFormData({...formData, paymentMethod: 'cash_on_delivery'})}
            disabled={total > 500}
          >
            <Ionicons name="cash-outline" size={24} color={formData.paymentMethod === 'cash_on_delivery' ? Colors.primary : colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentText, { color: total > 500 ? colors.textMuted : colors.text }]}>الدفع عند الاستلام</Text>
              {total > 500 && <Text style={{ color: Colors.accent, fontSize: 11, textAlign: 'left', marginTop: 2 }}>غير متاح للطلبات الأكثر من 500 ج.م</Text>}
            </View>
            {formData.paymentMethod === 'cash_on_delivery' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'paymob_card' ? Colors.primary : colors.border }]}
            onPress={() => setFormData({...formData, paymentMethod: 'paymob_card'})}
          >
            <Ionicons name="card-outline" size={24} color={formData.paymentMethod === 'paymob_card' ? Colors.primary : colors.textMuted} />
            <Text style={[styles.paymentText, { color: colors.text }]}>بطاقة بنكية (فيزا / ماستركارد)</Text>
            {formData.paymentMethod === 'paymob_card' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'paymob_wallet' ? Colors.primary : colors.border }]}
            onPress={() => setFormData({...formData, paymentMethod: 'paymob_wallet'})}
          >
            <Ionicons name="wallet-outline" size={24} color={formData.paymentMethod === 'paymob_wallet' ? Colors.primary : colors.textMuted} />
            <Text style={[styles.paymentText, { color: colors.text }]}>محفظة إلكترونية (فودافون كاش، اتصالات، إلخ)</Text>
            {formData.paymentMethod === 'paymob_wallet' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'instapay' ? Colors.primary : colors.border }]}
            onPress={() => setFormData({...formData, paymentMethod: 'instapay'})}
          >
            <Ionicons name="send-outline" size={24} color={formData.paymentMethod === 'instapay' ? Colors.primary : colors.textMuted} />
            <Text style={[styles.paymentText, { color: colors.text }]}>إنستا باي (InstaPay)</Text>
            {formData.paymentMethod === 'instapay' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'vodafone_cash' ? Colors.primary : colors.border }]}
            onPress={() => setFormData({...formData, paymentMethod: 'vodafone_cash'})}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={formData.paymentMethod === 'vodafone_cash' ? Colors.primary : colors.textMuted} />
            <Text style={[styles.paymentText, { color: colors.text }]}>فودافون كاش (تحويل مباشر)</Text>
            {formData.paymentMethod === 'vodafone_cash' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>
        </View>

        <View style={[styles.orderSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>ملخص الطلب</Text>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.textMuted }}>المنتجات ({cartCount})</Text>
            <Text style={{ color: colors.text }}>{subtotal.toLocaleString()} ج.م</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.textMuted }}>مصاريف الشحن</Text>
            <Text style={{ color: colors.text }}>{shipping} ج.م</Text>
          </View>
          {vatConfig.enabled ? (
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.textMuted }}>ضريبة القيمة المضافة ({vatConfig.percentage}%)</Text>
              <Text style={{ color: colors.text }}>{vat.toLocaleString()} ج.م</Text>
            </View>
          ) : null}
          {Boolean(appliedCoupon) ? (
            <View style={styles.summaryRow}>
              <Text style={{ color: Colors.success }}>خصم الكوبون</Text>
              <Text style={{ color: Colors.success }}>-{couponDiscount.toLocaleString()} ج.م</Text>
            </View>
          ) : null}
          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي المستحق</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} ج.م</Text>
          </View>
        </View>

        {/* Policy Agreement Checkbox */}
        <View style={styles.policyRow}>
          <TouchableOpacity 
            onPress={() => setAcceptPolicy(!acceptPolicy)}
            style={styles.checkbox}
          >
            <Ionicons 
              name={acceptPolicy ? "checkbox" : "square-outline"} 
              size={24} 
              color={acceptPolicy ? Colors.primary : colors.textMuted} 
            />
          </TouchableOpacity>
          <Text style={[styles.policyText, { color: colors.text }]}>
            أوافق على{' '}
            <Text 
              style={{ color: Colors.primary, fontWeight: 'bold' }}
              onPress={() => navigation.navigate('DynamicPage', { type: 'refund', title: 'سياسة الاستبدال والاسترجاع' })}
            >
              سياسة الاستبدال والاسترجاع
            </Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.orderBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
          disabled={loading}
          onPress={handlePlaceOrder}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>تأكيد الطلب</Text>}
        </TouchableOpacity>
      </View>

      {/* WebView for Paymob Payment */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={handleCancelPayment}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.webViewHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 15) }]}>
            <TouchableOpacity onPress={handleCancelPayment}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.webViewTitle, { color: colors.text }]}>الدفع الإلكتروني</Text>
            <View style={{ width: 26 }} />
          </View>
          {checkoutUrl ? (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              mixedContentMode="always"
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              scalesPageToFit={true}
              renderLoading={() => (
                <View style={styles.webLoading}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              )}
            />
          ) : null}
        </View>
      </Modal>

      {/* Verifying Payment Modal */}
      <Modal
        visible={isVerifyingPayment}
        transparent
        animationType="fade"
      >
        <View style={styles.resultOverlay}>
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 20 }} />
            <Text style={[styles.resultTitle, { color: colors.text }]}>جاري التحقق من الدفع...</Text>
            <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
              يرجى الانتظار، جاري تأكيد حالة العملية مع السيرفر والبنك.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Payment Result Modal */}
      <Modal
        visible={paymentResult !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.resultOverlay}>
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {paymentResult === 'success' && (
              <>
                <View style={[styles.resultIconBg, { backgroundColor: Colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>تم الدفع بنجاح!</Text>
                <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                  شكراً لك! لقد تم استلام طلبك ودفع قيمته بنجاح وسيتم شحنه قريباً.
                </Text>
                {currentOrderNumber && (
                  <Text style={[styles.orderNumberBadge, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}>
                    رقم الطلب: {currentOrderNumber}
                  </Text>
                )}
                <TouchableOpacity 
                  style={[styles.resultBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => {
                    setPaymentResult(null);
                    finishCheckout();
                  }}
                >
                  <Text style={styles.resultBtnText}>عرض الفواتير والطلبات</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentResult === 'pending' && (
              <>
                <View style={[styles.resultIconBg, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="time" size={80} color="#F59E0B" />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>الدفع قيد المراجعة ⏳</Text>
                <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                  معاملتك قيد المعالجة حالياً من قِبل البنك أو المحفظة الإلكترونية. طلبك مسجل لدينا ولا داعي لتكرار الدفع.
                </Text>
                {currentOrderNumber && (
                  <Text style={[styles.orderNumberBadge, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}>
                    رقم الطلب: {currentOrderNumber}
                  </Text>
                )}
                <TouchableOpacity 
                  style={[styles.resultBtn, { backgroundColor: '#F59E0B', marginBottom: 10 }]}
                  onPress={() => {
                    setPaymentResult(null);
                    finishCheckout();
                  }}
                >
                  <Text style={styles.resultBtnText}>متابعة الطلب في الفواتير</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resultBtnSecondary, { borderColor: colors.border }]}
                  onPress={() => setPaymentResult(null)}
                >
                  <Text style={[styles.resultBtnSecondaryText, { color: colors.text }]}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentResult === 'cancelled' && (
              <>
                <View style={[styles.resultIconBg, { backgroundColor: '#3B82F620' }]}>
                  <Ionicons name="information-circle" size={80} color="#3B82F6" />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>تم إلغاء عملية الدفع</Text>
                <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                  تم إلغاء عملية الدفع بناءً على رغبتك. جميع المنتجات محفوظة بالكامل في سلتك ولم تفقد أي شيء.
                </Text>
                <TouchableOpacity 
                  style={[styles.resultBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => setPaymentResult(null)}
                >
                  <Text style={styles.resultBtnText}>العودة لمتابعة الشراء</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentResult === 'failed' && (
              <>
                <View style={[styles.resultIconBg, { backgroundColor: Colors.accent + '20' }]}>
                  <Ionicons name="close-circle" size={80} color={Colors.accent} />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>لم تكتمل عملية الدفع</Text>
                <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                  تعذر إتمام عملية الدفع بواسطة البطاقة أو المحفظة. جميع المنتجات ما زالت محفوظة في سلتك.
                </Text>
                <TouchableOpacity 
                  style={[styles.resultBtn, { backgroundColor: Colors.primary, marginBottom: 10 }]}
                  onPress={() => setPaymentResult(null)}
                >
                  <Text style={styles.resultBtnText}>إعادة المحاولة</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resultBtnSecondary, { borderColor: colors.border }]}
                  onPress={() => {
                    setPaymentResult(null);
                    setFormData(prev => ({ ...prev, paymentMethod: 'cash_on_delivery' }));
                  }}
                >
                  <Text style={[styles.resultBtnSecondaryText, { color: colors.text }]}>الدفع عند الاستلام (COD)</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentResult === 'unavailable' && (
              <>
                <View style={[styles.resultIconBg, { backgroundColor: '#EF444420' }]}>
                  <Ionicons name="alert-circle" size={80} color="#EF4444" />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>تعذر التحقق من الدفع</Text>
                <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                  لم نتمكن من الوصول للسيرفر للتحقق من نتيجة الدفع. يمكنك إعادة المحاولة الآن أو التحقق لاحقاً من الفواتير.
                </Text>
                <TouchableOpacity 
                  style={[styles.resultBtn, { backgroundColor: Colors.primary, marginBottom: 10 }]}
                  onPress={async () => {
                    const orderIdToVerify = currentOrderId || (await storage.getItem(PENDING_ORDER_STORAGE_KEY));
                    if (orderIdToVerify) {
                      await verifyOrderPayment(orderIdToVerify);
                    } else {
                      setPaymentResult(null);
                    }
                  }}
                >
                  <Text style={styles.resultBtnText}>إعادة فحص الحالة</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resultBtnSecondary, { borderColor: colors.border }]}
                  onPress={() => {
                    setPaymentResult(null);
                    finishCheckout();
                  }}
                >
                  <Text style={[styles.resultBtnSecondaryText, { color: colors.text }]}>متابعة الفواتير</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'right' },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, marginBottom: 8, textAlign: 'right', fontWeight: '600' },
  input: { 
    height: 50, 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    fontSize: 15,
    textAlign: 'right'
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  divider: { height: 1, marginVertical: 25 },
  paymentOptionsList: { gap: 12, marginBottom: 25 },
  paymentOption: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    gap: 12,
  },
  paymentText: { flex: 1, fontSize: 16, fontWeight: '500', textAlign: 'right' },
  orderSummary: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 10, marginBottom: 25 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'right' },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  orderBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Coupon Styles
  couponSection: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: 15,
    textAlign: 'right',
  },
  couponBtn: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  appliedCouponBox: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  appliedCouponText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  removeCouponBtn: {
    padding: 4,
  },
  couponErrorText: {
    color: Colors.accent,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '600',
  },

  // Policy Styles
  policyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    padding: 4,
  },
  policyText: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },

  // WebView Styles
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  webLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  resultIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  resultBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderNumberBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultBtnSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
