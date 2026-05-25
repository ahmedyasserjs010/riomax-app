import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  params?: any;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];  
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#f8fafc', borderBottomColor: colors.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ direction: 'rtl' }}
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={styles.item}
        >
          <Ionicons name="home-outline" size={16} color={Colors.primary} />
          <Text style={[styles.label, { color: Colors.primary }]}>الرئيسية</Text>
        </TouchableOpacity>

        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Ionicons 
              name="chevron-back" 
              size={14} 
              color={colors.textMuted} 
              style={styles.separator} 
            />
            
            {item.path ? (
              <TouchableOpacity 
                onPress={() => navigation.navigate(item.path, item.params)}
                style={styles.item}
              >
                <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
                {item.label}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  scrollContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: 5,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  separator: {
    marginHorizontal: 2,
  },
});
