import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_NEWSLETTER_KEY = 'hasSeenNewsletterModal';

export function useFirstTimeNewsletterModal() {
  const [hasSeenModal, setHasSeenModal] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenModalStr = await AsyncStorage.getItem(FIRST_TIME_NEWSLETTER_KEY);
        const hasSeen = hasSeenModalStr === 'true';
        setHasSeenModal(hasSeen);
        
        // Show modal only if user hasn't seen it before
        if (!hasSeen) {
          // Small delay to ensure app is fully loaded
          setTimeout(() => {
            setShowModal(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking first time newsletter modal:', error);
        setHasSeenModal(true); // Default to not showing modal on error
      }
    };

    checkFirstTime();
  }, []);

  const markModalAsSeen = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_NEWSLETTER_KEY, 'true');
      setHasSeenModal(true);
      setShowModal(false);
    } catch (error) {
      console.error('Error marking newsletter modal as seen:', error);
    }
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return {
    showModal,
    markModalAsSeen,
    hideModal,
    hasSeenModal,
  };
}
