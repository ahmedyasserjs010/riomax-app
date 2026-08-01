import React, { useEffect, useRef, useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TOAST_DURATION = 3000;

export const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();
  const { colors, isDark } = useTheme();
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(1)).current;
  const [isVisible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      
      // Reset progress bar
      progressValue.setValue(1);

      // Entry animation
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Progress bar animation
      Animated.timing(progressValue, {
        toValue: 0,
        duration: TOAST_DURATION,
        useNativeDriver: false, // width/scaleX cannot be fully native in all RN versions smoothly for progress bars
      }).start();

    } else {
      // Exit animation
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [toast]);

  if (!isVisible && !toast) return null;

  // The toast state might be null during exit animation, so we keep the last known state if possible
  const currentToast = toast || { type: 'info', message: '' };

  const getToastConfig = () => {
    switch (currentToast.type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: Colors.success || '#10b981',
          bgTint: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: Colors.error || '#ef4444',
          bgTint: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          color: Colors.primary || '#ea580c',
          bgTint: isDark ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.1)',
        };
    }
  };

  const config = getToastConfig();

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, Math.max(insets.top + 10, 20)]
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 1, 1]
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }, { scale }],
          opacity,
          backgroundColor: colors.card,
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content} 
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {currentToast.message}
        </Text>
        <View style={[styles.iconContainer, { backgroundColor: config.bgTint }]}>
          <Ionicons name={config.icon as any} size={24} color={config.color} />
        </View>
      </TouchableOpacity>
      
      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: config.color,
              width: progressWidth
            }
          ]} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 16,
    zIndex: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'web' 
        ? { boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } as any
        : { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 15 }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold', // Assuming Cairo is used, fallback to standard if not
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderBottomLeftRadius: 16,
  },
});
