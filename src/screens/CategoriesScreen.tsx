import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { CategoryService } from '../services/HomeServices';
import { ICategory } from '../types';

const { width } = Dimensions.get('window');

export const CategoriesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fetch categories error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('CategoryProducts', { categoryId: item._id || item.id, name: item.name })}
          >
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: item.image?.secure_url }} 
                style={styles.image} 
                contentFit="contain" 
              />
            </View>
            <View style={[styles.nameWrapper, { borderTopColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  card: { 
    width: (width - 48) / 2, 
    margin: 6, 
    borderRadius: 16, 
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrapper: { 
    height: 120, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', // Keep white background for product/cat icons usually
    padding: 10
  },
  image: { width: '100%', height: '100%' },
  nameWrapper: { 
    padding: 12, 
    borderTopWidth: 1, 
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center'
  },
  name: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});
