import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Linking,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ContactScreen = () => {
  const { colors } = useTheme();

  const contactMethods = [
    { 
        id: 'whatsapp', 
        title: 'واتساب', 
        subtitle: '201097645386', 
        icon: 'logo-whatsapp', 
        color: '#25D366', 
        action: () => Linking.openURL('https://wa.me/201097645386') 
    },
    { 
        id: 'phone', 
        title: 'اتصل بنا', 
        subtitle: 'اضغط للاتصال المباشر', 
        icon: 'call-outline', 
        color: Colors.primary, 
        action: () => Linking.openURL('tel:201097645386') 
    },
    { 
        id: 'email', 
        title: 'البريد الإلكتروني', 
        subtitle: 'support@riomax.com.eg', 
        icon: 'mail-outline', 
        color: '#EA4335', 
        action: () => Linking.openURL('mailto:support@riomax.com.eg') 
    },
    { 
        id: 'facebook', 
        title: 'فيسبوك', 
        subtitle: 'تابعنا على فيسبوك', 
        icon: 'logo-facebook', 
        color: '#1877F2', 
        action: () => Linking.openURL('https://facebook.com/riomax') 
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={80} color={Colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>نحن هنا للمساعدة</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>تواصل معنا عبر أي من القنوات التالية وسنقوم بالرد عليك في أقرب وقت</Text>
      </View>

      <View style={styles.list}>
        {contactMethods.map((method) => (
          <TouchableOpacity 
            key={method.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={method.action}
          >
            <View style={[styles.iconBox, { backgroundColor: method.color + '15' }]}>
              <Ionicons name={method.icon as any} size={28} color={method.color} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
                <Text style={[styles.methodSubtitle, { color: colors.textMuted }]}>{method.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.footerTitle, { color: colors.text }]}>مواعيد العمل</Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>يومياً من الساعة 10 صباحاً وحتى 11 مساءً</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 40, gap: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 20 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    marginBottom: 16,
    gap: 16
  },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, alignItems: 'flex-start' },
  methodTitle: { fontSize: 16, fontWeight: 'bold' },
  methodSubtitle: { fontSize: 13, marginTop: 2 },
  footer: { margin: 20, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  footerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  footerText: { fontSize: 14 },
});
