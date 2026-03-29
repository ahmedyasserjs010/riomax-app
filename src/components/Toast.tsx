import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();
  const animatedValue = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (toast) {
      Animated.spring(animatedValue, {
        toValue: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return Colors.success || '#10b981';
      case 'error':
        return Colors.error || '#ef4444';
      case 'info':
        return Colors.primary || '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY: animatedValue }],
          backgroundColor: getBackgroundColor()
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content} 
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <Ionicons name={getIcon() as any} size={24} color="#fff" />
        <Text style={styles.message}>{toast.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 9999,
    ...(Platform.OS === 'web' 
        ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' } as any
        : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
});
