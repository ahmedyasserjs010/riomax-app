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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface ProfileSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isVisible, onClose, navigation }) => {
  const { colors } = useTheme();
  const { userData, isAuthenticated } = useUser();

  const navigateTo = (screen: string, params?: any) => {
    onClose();
    // Navigate specifically through the Profile stack
    navigation.navigate('Profile', { screen, params });
  };

  const menuItems = [
    { id: 'cart', title: 'السلة', icon: 'cart-outline', action: () => navigateTo('Cart') },
    { id: 'wishlist', title: 'المفضلة', icon: 'heart-outline', action: () => navigateTo('Wishlist') },
    { id: 'profile', title: 'بيانات صاحب الحساب', icon: 'person-outline', action: () => navigateTo('UserProfile') },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop - Right for RTL feel or Left for standard. User asked for sidebar when clicking "My Account" icon, usually it slides from right for Arabic. */}
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
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>RioMax Profile Sidebar</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row-reverse', // RTL sidebar behavior
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '2px 0px 10px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10 }),
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
    textAlign: 'left'
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'left'
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
    paddingVertical: 18,
    gap: 15,
    borderBottomWidth: 0.5,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500'
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
