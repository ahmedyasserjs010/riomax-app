import React from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface LogoutConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isVisible, onClose, onConfirm }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="log-out-outline" size={40} color={Colors.accent} />
              </View>
              
              <Text style={[styles.title, { color: colors.text }]}>تسجيل الخروج</Text>
              <Text style={[styles.message, { color: colors.textMuted }]}>
                هل أنت متأكد من أنك تريد تسجيل الخروج من حسابك؟
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]} 
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>إلغاء</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={onConfirm}
                >
                  <Text style={[styles.buttonText, { color: '#fff' }]}>خروج</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
  );
};

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 10px 20px rgba(0,0,0,0.3)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }),
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
