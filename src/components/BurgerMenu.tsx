import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface BurgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
  onLogout: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isVisible, onClose, navigation, onLogout }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userData, isAuthenticated } = useUser();

  const navigateTo = (screen: string, params?: any) => {
    onClose();
    navigation.navigate(screen, params);
  };

  const menuItems = [
    { id: 'home', title: 'الرئيسية', icon: 'home-outline', action: () => navigateTo('MainTabs', { screen: 'Home' }) },
    { id: 'products', title: 'كل المنتجات', icon: 'grid-outline', action: () => navigateTo('MainTabs', { screen: 'Products' }) },
    { id: 'contact', title: 'تواصل معنا', icon: 'chatbubbles-outline', action: () => navigateTo('Profile', { screen: 'Contact' }) },
  ];

  if (isAuthenticated) {
    menuItems.push({ id: 'password', title: 'تغيير كلمة المرور', icon: 'lock-closed-outline', action: () => navigateTo('Profile', { screen: 'ChangePassword' }) });
  }

  const [isInfoExpanded, setIsInfoExpanded] = React.useState(false);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdrop} />
        </Pressable>

        <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: Colors.primary }]}>
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{userData?.name || 'زائر'}</Text>
                <Text style={styles.userEmail}>{userData?.email || 'مرحباً بك في ريوماكس'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuList}>
            {menuItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={item.action}
              >
                <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            ))}

    

            {/* Collapsible Info Section */}
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]} 
              onPress={() => setIsInfoExpanded(!isInfoExpanded)}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.menuText, { color: colors.text, fontWeight: '600' }]}>معلومات مهمه عن Riomax</Text>
                <Ionicons 
                  name={isInfoExpanded ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color={colors.textMuted} 
                />
              </View>
            </TouchableOpacity>

            {isInfoExpanded && (
              <View style={styles.expandedContent}>
                <TouchableOpacity 
                  style={styles.subMenuItem} 
                  onPress={() => navigateTo('DynamicPage', { type: 'privacy', title: 'سياسة الخصوصية' })}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.subMenuText, { color: colors.text }]}>سياسة الخصوصية</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.subMenuItem} 
                  onPress={() => navigateTo('DynamicPage', { type: 'refund', title: 'سياسة الاسترداد والإلغاء' })}
                >
                  <Ionicons name="refresh-circle-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.subMenuText, { color: colors.text }]}>سياسة الاسترداد والإلغاء</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.subMenuItem} 
                  onPress={() => navigateTo('DynamicPage', { type: 'terms', title: 'سياسة التوصيل والشحن' })}
                >
                  <Ionicons name="car-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.subMenuText, { color: colors.text }]}>سياسة التوصيل والشحن</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.subMenuItem} 
                  onPress={() => navigateTo('Profile', { screen: 'QA' })}
                >
                  <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.subMenuText, { color: colors.text }]}>الأسئلة الشائعة</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.subMenuItem} 
                  onPress={() => navigateTo('Profile', { screen: 'About' })}
                >
                  <Ionicons name="information-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.subMenuText, { color: colors.text }]}>عن ريوماكس</Text>
                </TouchableOpacity>
              </View>
            )}

    

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={Colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              </Text>
            </TouchableOpacity>

            {isAuthenticated ? (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={22} color={Colors.accent} />
                <Text style={[styles.menuText, { color: Colors.accent, fontWeight: 'bold' }]}>تسجيل الخروج</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateTo('Auth', { screen: 'Login' })}
              >
                <Ionicons name="log-in-outline" size={22} color={Colors.primary} />
                <Text style={[styles.menuText, { color: Colors.primary, fontWeight: 'bold' }]}>تسجيل الدخول</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>RioMax v1.0.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '-2px 0px 10px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10 }),
    elevation: 10,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeBtn: {
    padding: 5,
  },
  menuList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
    borderBottomWidth: 0.5,
  },
  menuText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 12,
  },
  expandedContent: {
    paddingLeft: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    marginVertical: 5,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
  },
  subMenuText: {
    fontSize: 14,
  },
});
