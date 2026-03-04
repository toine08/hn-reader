import { useEffect, useState, useCallback } from 'react';
import * as Updates from 'expo-updates';

export function useAppUpdates() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const checkForUpdates = useCallback(async () => {
    try {
      // Only check for updates in production builds, not in dev mode
      if (__DEV__ || !Updates.isEnabled) {
        return;
      }

      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        // Optionally auto-download the update
        await downloadUpdate();
      } else {
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    try {
      setIsDownloading(true);
      await Updates.fetchUpdateAsync();
      setIsUpdatePending(true);
      setIsDownloading(false);
    } catch (error) {
      console.error('Error downloading update:', error);
      setIsDownloading(false);
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error applying update:', error);
    }
  }, []);

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
  };
}

