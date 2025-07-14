import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_MODAL_KEY = 'hasSeenNewsletterModal';

export const useFirstTimeModal = () => {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenModal = await AsyncStorage.getItem(FIRST_TIME_MODAL_KEY);
      if (hasSeenModal === null) {
        setShouldShowModal(true);
      }
    } catch (error) {
      console.error('Error checking first time modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markModalAsSeen = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_MODAL_KEY, 'true');
      setShouldShowModal(false);
    } catch (error) {
      console.error('Error marking modal as seen:', error);
    }
  };

  return {
    shouldShowModal,
    isLoading,
    markModalAsSeen,
  };
};
