import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReaderModeContextType {
  isReaderModeEnabled: boolean;
  toggleReaderMode: () => void;
}

const ReaderModeContext = createContext<ReaderModeContextType | undefined>(undefined);

export const ReaderModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReaderModeEnabled, setIsReaderModeEnabled] = useState(true); // Default to true

  useEffect(() => {
    // Load saved preference from AsyncStorage
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('readerMode');
        if (saved !== null) {
          setIsReaderModeEnabled(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading reader mode preference:', error);
      }
    };

    loadPreference();
  }, []);

  const toggleReaderMode = async () => {
    try {
      const newValue = !isReaderModeEnabled;
      setIsReaderModeEnabled(newValue);
      await AsyncStorage.setItem('readerMode', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving reader mode preference:', error);
    }
  };

  return (
    <ReaderModeContext.Provider value={{ isReaderModeEnabled, toggleReaderMode }}>
      {children}
    </ReaderModeContext.Provider>
  );
};

export const useReaderMode = () => {
  const context = useContext(ReaderModeContext);
  if (context === undefined) {
    throw new Error('useReaderMode must be used within a ReaderModeProvider');
  }
  return context;
};
