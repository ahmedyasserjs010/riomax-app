import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const TermsScreen = ({ route }: any) => {
  const { colors } = useTheme();
  const { title = 'الشروط والأحكام' } = route.params || {};

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.text, { color: colors.text }]}>
            نحن في ريوماكس نهتم بخصوصيتك ونظام التعامل. {`\n\n`}
            تم إنشاء هذه السياسة لضمان حقوق العميل والشركة على حد سواء. يرجى قراءة الشروط التالية بعناية: {`\n\n`}
            1. جميع المنتجات المعروضة تخضع لسياسة الضمان والاسترجاع المقررة من قبل جهاز حماية المستهلك المصري. {`\n\n`}
            2. يتم توصيل المنتجات خلال 2-5 أيام عمل من تاريخ تأكيد الطلب. {`\n\n`}
            3. يحق للعميل معاينة المنتج عند الاستلام قبل إتمام عملية الدفع. {`\n\n`}
            4. في حالة وجود أي عيب مصنعي، يرجى التواصل معنا خلال 14 يوماً من الاستلام للاسترجاع أو الاستبدال. {`\n\n`}
            5. خصوصية بياناتك مؤمنة ولن يتم استخدامها إلا لإتمام طلباتك وتحسين تجربتك معنا.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'left' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  text: { fontSize: 15, lineHeight: 28, textAlign: 'right' }
});
