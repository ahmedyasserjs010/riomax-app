import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Linking, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { PublicService, IFooterLinks } from '../services/PublicService';

export const ContactScreen = () => {
  const { colors } = useTheme();
  const [footerData, setFooterData] = useState<IFooterLinks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const data = await PublicService.getFooterLinks();
        setFooterData(data);
      } catch (err) {
        console.error('Error fetching contact info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const DEFAULT_DATA = {
    phone: "01113977788",
    whatsapp: "201044224537",
    address: "البساتين الشرقية، قسم البساتين، محافظة القاهرة",
    email: "riomaxshop@gmail.com",
    facebook: "https://www.facebook.com/share/17oVo1PHNL/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/riio_max?igsh=MTJ6dDR3MDl3NTMyZg%3D%3D&utm_source=qr",
    tiktok: "https://www.tiktok.com/@rio.max0?_r=1&_t=ZS-91t4XHfWrdS"
  };

  const phone = footerData?.phone || DEFAULT_DATA.phone;
  const whatsapp = footerData?.whatsapp || DEFAULT_DATA.whatsapp;
  const email = footerData?.email || DEFAULT_DATA.email;
  const address = footerData?.address || DEFAULT_DATA.address;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>تواصل معنا</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          نحن هنا لمساعدتك والإجابة على استفساراتك في أي وقت.
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL(`tel:${phone}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 88, 12, 0.1)' }]}>
              <Ionicons name="call" size={24} color={Colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>رقم الهاتف</Text>
              <Text style={[styles.cardValue, { color: colors.textMuted }]}>{phone}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL(`https://wa.me/${whatsapp.replace(/\D/g, '')}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(37, 211, 102, 0.1)' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>واتساب</Text>
              <Text style={[styles.cardValue, { color: colors.textMuted }]}>{whatsapp}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL(`mailto:${email}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="mail" size={24} color="#3b82f6" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>البريد الإلكتروني</Text>
              <Text style={[styles.cardValue, { color: colors.textMuted }]}>{email}</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}>
              <Ionicons name="location" size={24} color="#64748b" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>العنوان</Text>
              <Text style={[styles.cardValue, { color: colors.textMuted }]}>{address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.socialSection}>
          <Text style={[styles.socialMainTitle, { color: colors.text }]}>تابعنا على منصات التواصل الاجتماعي</Text>
          <View style={styles.socialButtons}>
            {Boolean(footerData?.facebookUrl || DEFAULT_DATA.facebook) ? (
              <TouchableOpacity 
                style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
                onPress={() => Linking.openURL(footerData?.facebookUrl || DEFAULT_DATA.facebook)}
              >
                <Ionicons name="logo-facebook" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
            {Boolean(footerData?.instagramUrl || DEFAULT_DATA.instagram) ? (
              <TouchableOpacity 
                style={[styles.socialBtn, { backgroundColor: '#E4405F' }]}
                onPress={() => Linking.openURL(footerData?.instagramUrl || DEFAULT_DATA.instagram)}
              >
                <Ionicons name="logo-instagram" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
            {Boolean(footerData?.tiktokUrl || DEFAULT_DATA.tiktok) ? (
              <TouchableOpacity 
                style={[styles.socialBtn, { backgroundColor: '#000' }]}
                onPress={() => Linking.openURL(footerData?.tiktokUrl || DEFAULT_DATA.tiktok)}
              >
                <Ionicons name="logo-tiktok" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: 'right', lineHeight: 24 },
  cardContainer: { gap: 15 },
  contactCard: { 
    flexDirection: 'row-reverse',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    alignItems: 'center',
    gap: 15
  },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4, textAlign: 'right' },
  cardValue: { fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  socialSection: { marginTop: 40, alignItems: 'center' },
  socialMainTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  socialButtons: { flexDirection: 'row', gap: 15 },
  socialBtn: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});
