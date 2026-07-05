import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { userData } = useUser();

  const menuItems = [
    { id: 'cart', title: 'السلة', icon: 'cart-outline', action: () => navigation.navigate('Home', { screen: 'Cart' }) },
    { id: 'wishlist', title: 'المفضلة', icon: 'heart-outline', action: () => navigation.navigate('Home', { screen: 'Wishlist' }) },
    { id: 'orders', title: 'طلباتي', icon: 'receipt-outline', action: () => navigation.navigate('Invoices') },
    { id: 'userProfile', title: 'بيانات المستخدم', icon: 'person-outline', action: () => navigation.navigate('UserProfile') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* User Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarText}>{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{userData?.name || 'مستخدم'}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{userData?.email}</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>الإعدادات العامة</Text>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.menuItem, { borderBottomColor: colors.border }]} 
            onPress={item.action}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
              <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>رقم الإصدار 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1 
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerInfo: { flex: 1, alignItems: 'flex-start' },
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'left' },
  userEmail: { fontSize: 14, textAlign: 'left' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginLeft: 20, marginBottom: 10, textAlign: 'left' },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 16, marginLeft: 16 },
  footer: { alignItems: 'center', padding: 30, marginTop: 20 },
  footerText: { fontSize: 12 }
});
