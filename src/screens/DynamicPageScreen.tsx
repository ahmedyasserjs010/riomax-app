import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { usePolicy } from '../hooks/useApi';

export const DynamicPageScreen = ({ route }: any) => {
  const { type, title } = route.params;
  const { colors } = useTheme();

  // Queries
  const { data: contentData, isLoading: loading } = usePolicy(type);
  const content = contentData || '';

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
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.text, { color: colors.text }]}>
            {content || 'لا يوجد محتوى حالياً.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'right' },
  card: { padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: Colors.primary, borderWidth: 1 },
  text: { fontSize: 16, lineHeight: 28, textAlign: 'right' }
});
