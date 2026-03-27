import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation }: any) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userData, logout } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: async () => {
          await logout();
        }}
      ]
    );
  };

  const menuItems = [
    { id: 'orders', title: 'طلباتي', icon: 'receipt-outline', action: () => navigation.navigate('Invoices') },
    { id: 'wishlist', title: 'المفضلة', icon: 'heart-outline', action: () => navigation.navigate('Wishlist') },
    { id: 'contact', title: 'تواصل معنا', icon: 'chatbubbles-outline', action: () => navigation.navigate('Contact') },
    { id: 'about', title: 'عن ريوماكس', icon: 'information-circle-outline', action: () => navigation.navigate('About') },
    { id: 'terms', title: 'الشروط والسياسات', icon: 'shield-outline', action: () => navigation.navigate('Terms') },
    { id: 'language', title: 'اللغة (العربية)', icon: 'language-outline', action: () => {} },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* User Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarText}>{userData?.name?.charAt(0).toUpperCase() || 'U'}</Text>
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
        
        {/* Dark Mode Toggle */}
        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name={isDark ? "moon" : "sunny-outline"} size={22} color={Colors.primary} />
            <Text style={[styles.menuTitle, { color: colors.text }]}>الوضع المظلم</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#767577', true: Colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.accent} />
        <Text style={styles.logoutBtnText}>تسجيل الخروج</Text>
      </TouchableOpacity>
      
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
    padding: 24, 
    paddingTop: 40,
    alignItems: 'center', 
    borderBottomWidth: 1 
  },
  avatar: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerInfo: { marginLeft: 16 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  userEmail: { fontSize: 14, marginTop: 4 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', textAlign: 'left' },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuTitle: { fontSize: 16 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 40, 
    padding: 16 
  },
  logoutBtnText: { color: Colors.accent, fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  footerText: { fontSize: 12 },
});
