// Newsletter service configuration
// Choose one of the following services to integrate with your newsletter

// Helper function to get environment variables in Expo
const getEnvVar = (key: string): string | undefined => {
  // For Expo with EXPO_PUBLIC_ prefix, variables should be available in process.env
  return process.env[key];
};

export interface NewsletterConfig {
  service: "localletter";
  apiKey?: string;
  audienceId?: string;
  baseUrl?: string;
}

// Configuration for different newsletter services
export const newsletterConfigs: Record<string, NewsletterConfig> = {
  // localletter configuration
  localletter: {
    service: "localletter",
    apiKey: getEnvVar("EXPO_PUBLIC_LOCALLETTER_API_KEY"),
    baseUrl: "https://hnreader.localletter.xyz/api/v1",
  },
};

// Select your preferred service here
export const currentConfig = newsletterConfigs.localletter; // Using Buttondown for free tier

// Newsletter API functions
export class NewsletterAPI {
  private config: NewsletterConfig;

  constructor(config: NewsletterConfig = currentConfig) {
    console.log(
      "NewsletterAPI constructor, config:",
      JSON.stringify(config, null, 2),
    );
    this.config = config;
  }

  async subscribe(email: string, name?: string): Promise<boolean> {
    try {
      // Debug logging removed for production safety

      switch (this.config.service) {
        case "localletter":
          return await this.subscribeLocalletter(email, name);
        default:
          throw new Error("Unsupported newsletter service");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      return false;
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      switch (this.config.service) {
        case "localletter":
          return await this.unsubscribeLocalletter(email);
        default:
          throw new Error("Unsupported newsletter service");
      }
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      return false;
    }
  }

  private async subscribeLocalletter(
    email: string,
    name?: string,
  ): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error("Localletter API key not configured");
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/subscribers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
        }),
      });

      const bodyText = await response.text();
      let body: any = null;

      try {
        body = bodyText ? JSON.parse(bodyText) : null;
      } catch {
        body = bodyText;
      }

      if (response.ok) {
        return true;
      }

      if (
        response.status === 400 ||
        response.status === 409 ||
        response.status === 422
      ) {
        const message =
          typeof body === "object" && body
            ? `${body.message ?? ""} ${JSON.stringify(body.details ?? "")}`.toLowerCase()
            : String(body).toLowerCase();

        if (
          message.includes("already subscribed") ||
          message.includes("already exists")
        ) {
          return true;
        }
      }

      console.error("Localletter subscription failed:", response.status, body);
      return false;
    } catch (error) {
      console.error("Localletter subscription error:", error);
      return false;
    }
  }

  private async unsubscribeLocalletter(email: string): Promise<boolean> {
    try {
      // First, get the subscriber ID
      const listResponse = await fetch(
        `${this.config.baseUrl}/subscribers?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!listResponse.ok) {
        console.log("GET failed, returning false");
        return false;
      }

      const subscribers = await listResponse.json();
      console.log("GET response:", subscribers);

      const subscriber =
        subscribers.subscriber ||
        (Array.isArray(subscribers) ? subscribers[0] : null);

      if (subscriber && subscriber.id) {
        const subscriberId = subscriber.id;

        // Unsubscribe the user
        const unsubscribeResponse = await fetch(
          `${this.config.baseUrl}/subscribers/${subscriberId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
            },
          },
        );

        return unsubscribeResponse.ok;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
