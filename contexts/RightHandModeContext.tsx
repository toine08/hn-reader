import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RightHandModeContextType {
  isRightHandMode: boolean;
  toggleRightHandMode: () => void;
}

const RightHandModeContext = createContext<RightHandModeContextType | undefined>(undefined);

export const RightHandModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRightHandMode, setIsRightHandMode] = useState(false);

  useEffect(() => {
    // Load saved preference from AsyncStorage
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('rightHandMode');
        if (saved !== null) {
          setIsRightHandMode(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading right-hand mode preference:', error);
      }
    };

    loadPreference();
  }, []);

  const toggleRightHandMode = async () => {
    try {
      const newValue = !isRightHandMode;
      setIsRightHandMode(newValue);
      await AsyncStorage.setItem('rightHandMode', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving right-hand mode preference:', error);
    }
  };

  return (
    <RightHandModeContext.Provider value={{ isRightHandMode, toggleRightHandMode }}>
      {children}
    </RightHandModeContext.Provider>
  );
};

export const useRightHandMode = () => {
  const context = useContext(RightHandModeContext);
  if (context === undefined) {
    throw new Error('useRightHandMode must be used within a RightHandModeProvider');
  }
  return context;
};
