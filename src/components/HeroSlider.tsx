import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 32; // Based on marginHorizontal: 16 in HomeScreen

interface HeroSliderProps {
  data: any[]; // Array of ISlider or any object with an image URL
  autoPlayInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ data, autoPlayInterval = 3000 }) => {
  const { colors, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (data.length <= 1) return;
    
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeIndex, data.length]);

  const goToPrev = () => {
    stopAutoPlay();
    let nextIndex = activeIndex - 1;
    if (nextIndex < 0) nextIndex = data.length - 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const goToNext = () => {
    stopAutoPlay();
    let nextIndex = activeIndex + 1;
    if (nextIndex >= data.length) nextIndex = 0;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  if (!data || data.length === 0) return null;

  return (
    <View 
      style={styles.container}
      {...(Platform.OS === 'web' ? { onMouseEnter: stopAutoPlay, onMouseLeave: startAutoPlay } as any : {})}
    >
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={Platform.OS !== 'web'} // Arrow buttons map better on web, but swipe works natively
        keyExtractor={(item, index) => (item._id || item.id || index.toString())}
        getItemLayout={(_, index) => ({
          length: SLIDER_WIDTH,
          offset: SLIDER_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
          if (index !== activeIndex) setActiveIndex(index);
        }}
        onScroll={(event) => {
          // Fallback for smoother index tracking on some platforms
          const index = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
          if (index !== activeIndex) {
            // Only update if it's a significant change to avoid unnecessary renders
            const scrollX = event.nativeEvent.contentOffset.x;
            if (Math.abs(scrollX - index * SLIDER_WIDTH) < 5) {
               setActiveIndex(index);
            }
          }
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const imgUrl = item.image?.secure_url || item.imageUrl;
          return (
            <View style={styles.slide}>
              <Image 
                source={{ uri: imgUrl }} 
                style={[styles.image, { backgroundColor: isDark ? colors.card : '#f8fafc' }]} 
                contentFit="cover" 
              />
            </View>
          );
        }}
      />

      {/* Navigation Arrows */}
      {data.length > 1 && (
        <>
          <TouchableOpacity 
            style={[styles.arrowBtn, styles.arrowLeft]} 
            onPress={goToPrev}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.arrowBtn, styles.arrowRight]} 
            onPress={goToNext}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination Dots */}
      {data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                i === activeIndex ? styles.activeDot : { backgroundColor: 'rgba(255,255,255,0.5)' }
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }),
    elevation: 3,
  },
  slide: {
    width: SLIDER_WIDTH,
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 5px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }),
    elevation: 4,
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.primary,
  },
});
