import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export default function Toast({ 
  visible, 
  message, 
  type = 'info', 
  duration = 3000, 
  onHide 
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'exclamation-circle';
      default:
        return 'info-circle';
    }
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className={`absolute top-12 left-4 right-4 z-50 ${getBackgroundColor()} rounded-lg p-4 flex-row items-center shadow-lg`}
    >
      <FontAwesome name={getIcon()} size={20} color="white" />
      <Text className="text-white ml-3 flex-1 font-medium">
        {message}
      </Text>
    </Animated.View>
  );
}
