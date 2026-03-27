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
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export const AboutScreen = () => {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icon.png')} // Best guess for logo
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.brandName, { color: Colors.primary }]}>ريوماكس - RioMax</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>من نحن؟</Text>
          <Text style={[styles.text, { color: colors.text }]}>
             نحن في ريوماكس نسعى لتوفير أفضل تجربة تسوق لعملائنا في مصر. نقدم مجموعة متنوعة من الأجهزة المنزلية ومنتجات العناية الشخصية والألعاب بأعلى جودة وأفضل الأسعار.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>لماذا ريوماكس؟</Text>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>ضمان حقيقي على جميع المنتجات</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>توصيل سريع لجميع المحافظات</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>دعم فني متميز وخدمة عملاء</Text>
          </View>
        </View>

        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, { color: colors.textMuted }]}>تابعنا على منصات التواصل</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity onPress={() => Linking.openURL('https://facebook.com')}>
              <Ionicons name="logo-facebook" size={32} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com')}>
              <Ionicons name="logo-instagram" size={32} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/201097645386')}>
              <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  logoContainer: { alignItems: 'center', marginVertical: 40 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  brandName: { fontSize: 24, fontWeight: 'bold' },
  section: { 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'left' },
  text: { fontSize: 15, lineHeight: 24, textAlign: 'left' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { fontSize: 15 },
  socialSection: { marginTop: 20, alignItems: 'center' },
  socialTitle: { fontSize: 14, marginBottom: 20 },
  socialRow: { flexDirection: 'row', gap: 30 },
});
