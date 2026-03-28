import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from '../components/AuthGuard';
import { UserService } from '../services/ProfileServices';

export const UserProfileScreen = () => {
  const { colors } = useTheme();
  const { fullProfile, refreshProfile, isLoading: isAuthLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    if (fullProfile) {
      setFormData({
        name: fullProfile.name || '',
        phone: fullProfile.phone || '',
        governorate: fullProfile.governorate || '',
        city: fullProfile.city || '',
        address: fullProfile.address || '',
      });
    }
  }, [fullProfile]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return;
    }

    setIsSaving(true);
    try {
      await UserService.updateProfile(formData);
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('نجاح', 'تم تحديث البيانات بنجاح');
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'فشل تحديث البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  const EditableField = ({ icon, label, value, keyName, placeholder, keyboardType = 'default' }: any) => (
    <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, { color: colors.text, borderBottomColor: Colors.primary }]}
            value={formData[keyName as keyof typeof formData]}
            onChangeText={(text) => setFormData({ ...formData, [keyName]: text })}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={keyboardType}
            textAlign="right"
          />
        ) : (
          <Text style={[styles.value, { color: colors.text }]}>{value || 'غير متوفر'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <AuthGuard 
      title="لم تقم بعد بتسجيل الدخول" 
      subtitle="قم بتسجيل الدخول لعرض وتعديل بياناتك"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: colors.background }]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>
                {fullProfile?.name ? fullProfile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{fullProfile?.name}</Text>
            <Text style={[styles.email, { color: colors.textMuted }]}>{fullProfile?.email}</Text>
            
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: Colors.primary }]}
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons 
                    name={isEditing ? "checkmark-outline" : "create-outline"} 
                    size={18} 
                    color={Colors.primary} 
                  />
                  <Text style={[styles.editButtonText, { color: Colors.primary }]}>
                    {isEditing ? 'حفظ التغييرات' : 'تعديل البيانات'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  // Reset form data
                  setFormData({
                    name: fullProfile?.name || '',
                    phone: fullProfile?.phone || '',
                    governorate: fullProfile?.governorate || '',
                    city: fullProfile?.city || '',
                    address: fullProfile?.address || '',
                  });
                }}
              >
                <Text style={{ color: colors.textMuted }}>إلغاء</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>البيانات الشخصية</Text>
            
            <EditableField 
              icon="person-outline" 
              label="الاسم بالكامل" 
              value={fullProfile?.name} 
              keyName="name"
              placeholder="مثلاً: محمد أحمد"
            />
            <EditableField 
              icon="call-outline" 
              label="رقم الهاتف" 
              value={fullProfile?.phone} 
              keyName="phone"
              placeholder="01xxxxxxxxx"
              keyboardType="phone-pad"
            />
            <EditableField 
              icon="map-outline" 
              label="المحافظة" 
              value={fullProfile?.governorate} 
              keyName="governorate"
              placeholder="مثلاً: القاهرة"
            />
            <EditableField 
              icon="business-outline" 
              label="المدينة / المنطقة" 
              value={fullProfile?.city} 
              keyName="city"
              placeholder="مثلاً: مدينة نصر"
            />
            <EditableField 
              icon="location-outline" 
              label="العنوان بالتفصيل" 
              value={fullProfile?.address} 
              keyName="address"
              placeholder="مثلاً: شارع التسعين، مبنى رقم 1"
            />
          </View>

          <View style={styles.footerInfo}>
             <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
             <Text style={[styles.footerText, { color: colors.textMuted }]}>
               يتم استخدام هذه البيانات لتسهيل عملية الشحن وتوصيل الطلبات إليك.
             </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 20 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  editButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 12,
  },
  card: { 
    marginHorizontal: 16, 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'right' 
  },
  fieldContainer: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderBottomWidth: 1 
  },
  iconContainer: { width: 40, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginRight: 12 },
  label: { fontSize: 13, marginBottom: 4, textAlign: 'right' },
  value: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  input: { 
    fontSize: 15, 
    paddingVertical: 4, 
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  footerInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    marginRight: 8,
    textAlign: 'right',
    flex: 1,
  }
});
