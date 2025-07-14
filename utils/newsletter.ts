// Newsletter service configuration
// Choose one of the following services to integrate with your newsletter

import Constants from 'expo-constants';

// Helper function to get environment variables in Expo
const getEnvVar = (key: string): string | undefined => {
  // For Expo with EXPO_PUBLIC_ prefix, variables should be available in process.env
  return process.env[key];
};

export interface NewsletterConfig {
  service: 'mailchimp' | 'convertkit' | 'buttondown' | 'substack' | 'custom';
  apiKey?: string;
  audienceId?: string;
  baseUrl?: string;
}

// Configuration for different newsletter services
export const newsletterConfigs: Record<string, NewsletterConfig> = {
  // Mailchimp configuration
  mailchimp: {
    service: 'mailchimp',
    apiKey: getEnvVar('EXPO_PUBLIC_MAILCHIMP_API_KEY'),
    audienceId: getEnvVar('EXPO_PUBLIC_MAILCHIMP_AUDIENCE_ID'),
    baseUrl: 'https://us1.api.mailchimp.com/3.0' // Replace 'us1' with your datacenter
  },

  // ConvertKit configuration  
  convertkit: {
    service: 'convertkit',
    apiKey: getEnvVar('EXPO_PUBLIC_CONVERTKIT_API_KEY'),
    audienceId: getEnvVar('EXPO_PUBLIC_CONVERTKIT_FORM_ID'),
    baseUrl: 'https://api.convertkit.com/v3'
  },

  // Buttondown configuration
  buttondown: {
    service: 'buttondown',
    apiKey: getEnvVar('EXPO_PUBLIC_BUTTONDOWN_API_KEY'),
    baseUrl: 'https://api.buttondown.email/v1'
  },

  // Custom backend service
  custom: {
    service: 'custom',
    apiKey: getEnvVar('EXPO_PUBLIC_NEWSLETTER_API_KEY'),
    baseUrl: getEnvVar('EXPO_PUBLIC_NEWSLETTER_API_URL')
  }
};

// Select your preferred service here
export const currentConfig = newsletterConfigs.buttondown; // Using Buttondown for free tier

// Newsletter API functions
export class NewsletterAPI {
  private config: NewsletterConfig;

  constructor(config: NewsletterConfig = currentConfig) {
    this.config = config;
  }

  async subscribe(email: string, name?: string): Promise<boolean> {
    try {
      // Debug logging
      console.log('Newsletter service:', this.config.service);
      console.log('API Key available:', !!this.config.apiKey);
      console.log('API Key length:', this.config.apiKey?.length);
      
      switch (this.config.service) {
        case 'mailchimp':
          return await this.subscribeMailchimp(email, name);
        case 'convertkit':
          return await this.subscribeConvertKit(email, name);
        case 'buttondown':
          return await this.subscribeButtondown(email, name);
        case 'custom':
          return await this.subscribeCustom(email, name);
        default:
          throw new Error('Unsupported newsletter service');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return false;
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      switch (this.config.service) {
        case 'mailchimp':
          return await this.unsubscribeMailchimp(email);
        case 'convertkit':
          return await this.unsubscribeConvertKit(email);
        case 'buttondown':
          return await this.unsubscribeButtondown(email);
        case 'custom':
          return await this.unsubscribeCustom(email);
        default:
          throw new Error('Unsupported newsletter service');
      }
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return false;
    }
  }

  private async subscribeMailchimp(email: string, name?: string): Promise<boolean> {
    if (!this.config.apiKey || !this.config.audienceId) {
      throw new Error('Mailchimp API key or audience ID not configured');
    }

    const response = await fetch(
      `${this.config.baseUrl}/lists/${this.config.audienceId}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: name ? { FNAME: name } : {},
        }),
      }
    );

    return response.ok;
  }

  private async subscribeConvertKit(email: string, name?: string): Promise<boolean> {
    if (!this.config.apiKey || !this.config.audienceId) {
      throw new Error('ConvertKit API key or form ID not configured');
    }

    const response = await fetch(
      `${this.config.baseUrl}/forms/${this.config.audienceId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.apiKey,
          email,
          first_name: name,
        }),
      }
    );

    return response.ok;
  }

  private async subscribeButtondown(email: string, name?: string): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Buttondown API key not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          notes: name ? `Name: ${name}` : '',
          tags: ['hn-reader-app'], // Tag to identify subscribers from your app
        }),
      });

      // Handle successful subscription or already subscribed
      if (response.ok) {
        return true;
      }

      // Check if user is already subscribed (Buttondown returns 400 for duplicates)
      if (response.status === 400 || response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && (
          errorData.detail.includes('already subscribed') ||
          errorData.detail.includes('already exists')
        )) {
          return true; // Treat as success if already subscribed
        }
      }

      console.error('Buttondown subscription failed:', response.status, await response.text());
      return false;
    } catch (error) {
      console.error('Buttondown subscription error:', error);
      return false;
    }
  }

  private async subscribeCustom(email: string, name?: string): Promise<boolean> {
    if (!this.config.baseUrl) {
      throw new Error('Custom API URL not configured');
    }

    const response = await fetch(`${this.config.baseUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        email,
        name,
        source: 'hn-reader-app',
      }),
    });

    return response.ok;
  }

  private async unsubscribeMailchimp(email: string): Promise<boolean> {
    // Implementation for Mailchimp unsubscribe
    // You'll need to implement this based on Mailchimp's API
    return true;
  }

  private async unsubscribeConvertKit(email: string): Promise<boolean> {
    // Implementation for ConvertKit unsubscribe
    // You'll need to implement this based on ConvertKit's API
    return true;
  }

  private async unsubscribeButtondown(email: string): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Buttondown API key not configured');
    }

    try {
      // First, get the subscriber ID
      const listResponse = await fetch(`${this.config.baseUrl}/subscribers?email=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!listResponse.ok) {
        return false;
      }

      const subscribers = await listResponse.json();
      if (subscribers.results && subscribers.results.length > 0) {
        const subscriberId = subscribers.results[0].id;
        
        // Unsubscribe the user
        const unsubscribeResponse = await fetch(`${this.config.baseUrl}/subscribers/${subscriberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${this.config.apiKey}`,
          },
        });

        return unsubscribeResponse.ok;
      }
      
      return false;
    } catch (error) {
      console.error('Buttondown unsubscribe error:', error);
      return false;
    }
  }

  private async unsubscribeCustom(email: string): Promise<boolean> {
    if (!this.config.baseUrl) {
      throw new Error('Custom API URL not configured');
    }

    const response = await fetch(`${this.config.baseUrl}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        email,
      }),
    });

    return response.ok;
  }
}
