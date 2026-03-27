import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  FlatList,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { ICategory, ISubCategory } from '../types';

const { width, height } = Dimensions.get('window');

interface FilterBoxProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSubmitSearch: () => void;
  categories: ICategory[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  subCategories: ISubCategory[];
  selectedSubCategory: string | null;
  onSelectSubCategory: (subCatId: string | null) => void;
  totalProductsCount: number;
}

const DropdownSelector = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  placeholder,
  disabled = false
}: { 
  label: string; 
  value: string | null; 
  options: { id: string; name: string }[]; 
  onSelect: (id: string | null) => void; 
  placeholder: string;
  disabled?: boolean;
}) => {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return placeholder;
    const opt = options.find(o => o.id === value);
    return opt ? opt.name : placeholder;
  }, [value, options, placeholder]);

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.dropdownBtn, 
          { 
            backgroundColor: isDark ? colors.card : '#ffffff',
            borderColor: colors.border,
            opacity: disabled ? 0.5 : 1
          }
        ]}
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        <Text style={[styles.dropdownText, { color: value ? colors.text : colors.textMuted }]}>
          {selectedName}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: null, name: 'الكل' }, ...options]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    onSelect(item.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText, 
                    { 
                      color: item.id === value ? Colors.primary : colors.text,
                      fontWeight: item.id === value ? 'bold' : 'normal'
                    }
                  ]}>
                    {item.name}
                  </Text>
                  {item.id === value && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export const FilterBox: React.FC<FilterBoxProps> = ({
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  categories,
  selectedCategory,
  onSelectCategory,
  subCategories,
  selectedSubCategory,
  onSelectSubCategory,
  totalProductsCount
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#fafafa', borderColor: colors.border }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.background : '#ffffff', borderColor: colors.border }]}>
        <TouchableOpacity onPress={onSubmitSearch}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث عن منتج..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          onSubmitEditing={onSubmitSearch}
          returnKeyType="search"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => { onSearchChange(''); onSubmitSearch(); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Dropdown */}
      <DropdownSelector
        label="اختر القسم"
        placeholder="جميع الأقسام"
        value={selectedCategory}
        options={categories.map(c => ({ id: c._id || c.id, name: c.name }))}
        onSelect={(val) => {
          onSelectCategory(val);
          // Auto-clear subcategory when changing primary category
          onSelectSubCategory(null);
        }}
      />

      {/* SubCategory Dropdown */}
      <DropdownSelector
        label="اختر القسم الفرعي"
        placeholder="جميع الأقسام الفرعية"
        value={selectedSubCategory}
        options={subCategories.map(sc => ({ id: sc._id || sc.id, name: sc.name }))}
        onSelect={onSelectSubCategory}
        disabled={!selectedCategory || subCategories.length === 0}
      />

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textMuted }]}>
          تم العثور على <Text style={styles.resultsHighlight}>{totalProductsCount}</Text> منتج
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 8px 24px rgba(0,0,0,0.06)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16 }),
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    height: '100%',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
    fontWeight: '500',
  },
  resultsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultsHighlight: {
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.4,
    maxHeight: height * 0.7,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
});
