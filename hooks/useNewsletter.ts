import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsletterAPI } from '@/utils/newsletter';

export interface NewsletterSubscription {
  email: string;
  name?: string;
  subscriptionDate: string;
  isActive: boolean;
}

export const useNewsletter = () => {
  const [subscription, setSubscription] = useState<NewsletterSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const newsletterAPI = new NewsletterAPI();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const [email, name, subscribed, subscriptionDate] = await Promise.all([
        AsyncStorage.getItem('newsletter_email'),
        AsyncStorage.getItem('newsletter_name'),
        AsyncStorage.getItem('newsletter_subscribed'),
        AsyncStorage.getItem('newsletter_subscription_date')
      ]);

      if (subscribed === 'true' && email) {
        setSubscription({
          email,
          name: name || undefined,
          subscriptionDate: subscriptionDate || new Date().toISOString(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error loading newsletter subscription:', error);
    }
  };

  const subscribe = async (email: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try to subscribe via the configured newsletter service
      const apiSuccess = await newsletterAPI.subscribe(email, name);
      
      if (apiSuccess) {
        const subscriptionDate = new Date().toISOString();
        
        await Promise.all([
          AsyncStorage.setItem('newsletter_email', email),
          AsyncStorage.setItem('newsletter_subscribed', 'true'),
          AsyncStorage.setItem('newsletter_subscription_date', subscriptionDate),
          ...(name ? [AsyncStorage.setItem('newsletter_name', name)] : [])
        ]);

        const newSubscription: NewsletterSubscription = {
          email,
          name,
          subscriptionDate,
          isActive: true
        };

        setSubscription(newSubscription);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription?.email) return false;
    
    setIsLoading(true);
    
    try {
      // Try to unsubscribe via the configured newsletter service
      const apiSuccess = await newsletterAPI.unsubscribe(subscription.email);
      
      if (apiSuccess) {
        await Promise.all([
          AsyncStorage.removeItem('newsletter_email'),
          AsyncStorage.removeItem('newsletter_name'),
          AsyncStorage.removeItem('newsletter_subscribed'),
          AsyncStorage.removeItem('newsletter_subscription_date')
        ]);

        setSubscription(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscription?.isActive
  };
};
