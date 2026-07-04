import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { Colors } from '../theme/colors';

interface TopNavbarProps {
  title?: string;
  onMenuPress: () => void;
  navigation: any;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title = 'ريوماكس', onMenuPress, navigation }) => {
  const { colors, isDark } = useTheme();
  const { cartCount } = useCart();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]}>
      <View style={[styles.container, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <Ionicons name="menu-outline" size={28} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
          style={styles.titleContainer}
        >
          <Text style={[styles.title, { color: Colors.primary }]}>{title}</Text>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile', { screen: 'Invoices' })} 
            style={styles.iconButton}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Wishlist')} 
            style={styles.iconButton}
          >
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart')} 
            style={styles.iconButton}
          >
            <View>
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
