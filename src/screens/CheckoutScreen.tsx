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
  Linking 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { OrderService } from '../services/ProfileServices';
import { Ionicons } from '@expo/vector-icons';
import { IProduct } from '../types';

const EGYPT_GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية', 'الدقهلية', 'القليوبية', 'المنيا', 
    'الغربية', 'سوهاج', 'أسيوط', 'المنوفية', 'البحيرة', 'الفيوم', 'كفر الشيخ', 
    'قنا', 'بني سويف', 'أسوان', 'دمياط', 'الإسماعيلية', 'الأقصر', 'بورسعيد', 
    'السويس', 'مطروح', 'شمال سيناء', 'البحر الأحمر', 'الوادي الجديد', 'جنوب سيناء'
];

export const CheckoutScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { cartItems, refreshCart, cartCount } = useCart();
  const { userData } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    governorate: userData?.governorate || '',
    city: userData?.city || '',
    address: userData?.address || '',
    paymentMethod: 'cash_on_delivery'
  });

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const product = item.Products as IProduct;
      return acc + (product.priceAfterDiscount * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.governorate) {
      Alert.alert('خطأ', 'يرجى إكمال جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cartItems: cartItems.map(item => ({
          productId: (item.Products as any)._id || (item.Products as any).id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          governorate: formData.governorate,
          city: formData.city,
          address: formData.address
        },
        paymentMethod: formData.paymentMethod,
        totalPrice: calculateTotal()
      };

      const response = await OrderService.createOrder(payload);
      Alert.alert(
        'نجاح', 
        'تم تأكيد طلبك بنجاح. سيتم التواصل معك قريباً.',
        [{ text: 'تواصل عبر واتساب', onPress: () => {
          Linking.openURL('https://wa.me/201097645386');
          finishCheckout();
        }}, { text: 'حسناً', onPress: () => finishCheckout() }]
      );
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل في إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  const finishCheckout = async () => {
    await refreshCart();
    navigation.navigate('Home'); 
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
          <Text style={[styles.label, { color: colors.text }]}>المحافظة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.govScroll}>
            {EGYPT_GOVERNORATES.map(gov => (
              <TouchableOpacity 
                key={gov}
                style={[
                  styles.govChip, 
                  { borderColor: colors.border },
                  formData.governorate === gov && { backgroundColor: Colors.primary, borderColor: Colors.primary }
                ]}
                onPress={() => setFormData({...formData, governorate: gov})}
              >
                <Text style={[
                  { color: colors.text },
                  formData.governorate === gov && { color: '#fff', fontWeight: 'bold' }
                ]}>{gov}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>طريقة الدفع</Text>
        <TouchableOpacity 
          style={[styles.paymentOption, { backgroundColor: colors.card, borderColor: formData.paymentMethod === 'cash_on_delivery' ? Colors.primary : colors.border }]}
          onPress={() => setFormData({...formData, paymentMethod: 'cash_on_delivery'})}
        >
          <Ionicons name="cash-outline" size={24} color={Colors.primary} />
          <Text style={[styles.paymentText, { color: colors.text }]}>الدفع عند الاستلام</Text>
          {formData.paymentMethod === 'cash_on_delivery' && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
        </TouchableOpacity>

        <View style={[styles.orderSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>ملخص الطلب</Text>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.textMuted }}>المنتجات ({cartCount})</Text>
            <Text style={{ color: colors.text }}>{calculateTotal()} ج.م</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.textMuted }}>مصاريف الشحن</Text>
            <Text style={{ color: Colors.success }}>حسب المحافظة</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>الإجمالي المستحق</Text>
            <Text style={styles.totalValue}>{calculateTotal()} ج.م</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.orderBtn, { backgroundColor: loading ? colors.border : Colors.primary }]}
          disabled={loading}
          onPress={handlePlaceOrder}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>تأكيد الطلب</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'left' },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, marginBottom: 8, textAlign: 'left', fontWeight: '600' },
  input: { 
    height: 50, 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    fontSize: 15,
    textAlign: 'right'
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  govScroll: { flexDirection: 'row', paddingVertical: 5 },
  govChip: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginRight: 10 
  },
  divider: { height: 1, marginVertical: 25 },
  paymentOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    gap: 12,
    marginBottom: 20
  },
  paymentText: { flex: 1, fontSize: 16, fontWeight: '500', textAlign: 'left' },
  orderSummary: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 10, marginBottom: 30 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'left' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  orderBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
