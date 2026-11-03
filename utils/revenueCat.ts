import Constants from "expo-constants";
import { Platform } from "react-native";
import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";

export const READING_SPRINT_ENTITLEMENT = "reading_sprint";

export type RevenueCatState = {
  configured: boolean;
  isPremium: boolean;
  packages: PurchasesPackage[];
};

type PurchasesClient = typeof import("react-native-purchases")["default"];

function getApiKey(): string | undefined {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  }
  return undefined;
}

export function isRevenueCatAvailable(): boolean {
  return Boolean(
    getApiKey() &&
      Platform.OS !== "web" &&
      Constants.executionEnvironment !== "storeClient",
  );
}

async function loadPurchasesClient(): Promise<PurchasesClient | null> {
  if (!isRevenueCatAvailable()) return null;
  const module = await import("react-native-purchases");
  return module.default;
}

export async function configureRevenueCat(): Promise<boolean> {
  const apiKey = getApiKey();
  if (
    !apiKey ||
    Platform.OS === "web" ||
    Constants.executionEnvironment === "storeClient"
  ) {
    return false;
  }

  const purchases = await loadPurchasesClient();
  if (!purchases) return false;

  if (!(await purchases.isConfigured())) {
    purchases.configure({ apiKey });
  }
  return true;
}

function hasSprintEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[READING_SPRINT_ENTITLEMENT]);
}

export async function getRevenueCatState(): Promise<RevenueCatState> {
  const configured = await configureRevenueCat();
  if (!configured) return { configured: false, isPremium: false, packages: [] };

  const purchases = await loadPurchasesClient();
  if (!purchases) return { configured: false, isPremium: false, packages: [] };

  const [customerInfo, offerings] = await Promise.all([
    purchases.getCustomerInfo(),
    purchases.getOfferings(),
  ]);

  return {
    configured: true,
    isPremium: hasSprintEntitlement(customerInfo),
    packages: offerings.current?.availablePackages ?? [],
  };
}

export async function trackReadingSprintPaywallImpression(): Promise<void> {
  const configured = await configureRevenueCat();
  if (!configured) return;

  const purchases = await loadPurchasesClient();
  if (!purchases) return;

  await purchases.trackCustomPaywallImpression({ paywallId: "reading_sprint" });
}

export async function purchaseReadingSprint(
  purchasePackage: PurchasesPackage,
): Promise<boolean> {
  const configured = await configureRevenueCat();
  const purchases = configured ? await loadPurchasesClient() : null;
  if (!purchases) throw new Error("RevenueCat is not configured for this build.");

  const result = await purchases.purchasePackage(purchasePackage);
  return hasSprintEntitlement(result.customerInfo);
}

export async function restoreReadingSprintPurchases(): Promise<boolean> {
  const configured = await configureRevenueCat();
  const purchases = configured ? await loadPurchasesClient() : null;
  if (!purchases) throw new Error("RevenueCat is not configured for this build.");

  const customerInfo = await purchases.restorePurchases();
  return hasSprintEntitlement(customerInfo);
}
