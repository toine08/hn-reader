import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { Article } from "@/utils/types";
import { useColorScheme } from "@/components/useColorScheme";
import {
  clearReadingSprintSession,
  getReadingSprintDailyCount,
  getReadingSprintSession,
  getReadingSprintStories,
  ReadingSprintSession,
  ReadingSprintStatus,
  READING_SPRINT_DAILY_LIMIT,
  READING_SPRINT_REMINDER_KEY,
  saveReadingSprintSession,
  setReadingSprintStatus,
} from "@/utils/readingSprint";
import {
  getRevenueCatState,
  isRevenueCatAvailable,
  purchaseReadingSprint,
  RevenueCatState,
  restoreReadingSprintPurchases,
  trackReadingSprintPaywallImpression,
} from "@/utils/revenueCat";

const SESSION_LENGTHS = [5, 15, 30] as const;
type SessionLength = (typeof SESSION_LENGTHS)[number];
type SprintTab = ReadingSprintStatus | "saved";
type PurchaseAction = "monthly" | "annual" | "restore";

const PRIVACY_POLICY_URL =
  "https://hackernewsreaderapp.download/privacy-policy";
const TERMS_OF_USE_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const localDebugPremiumEnabled =
  __DEV__ && process.env.EXPO_PUBLIC_DEBUG_PREMIUM === "true";

const initialRevenueCatState: RevenueCatState = {
  configured: false,
  isPremium: false,
  packages: [],
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function planPackage(
  packages: PurchasesPackage[],
  plan: "monthly" | "annual",
): PurchasesPackage | undefined {
  return packages.find((item) => {
    const type = String(item.packageType).toUpperCase();
    return plan === "monthly"
      ? type === "MONTHLY"
      : type === "ANNUAL" || type === "YEARLY";
  });
}

function formatSubscriptionPeriod(
  period: string | null,
  fallback: string,
): string {
  const match = period?.match(/^P(\d+)([DWMY])$/);
  if (!match) return fallback;

  const [, count, unitCode] = match;
  const units: Record<string, string> = {
    D: "day",
    W: "week",
    M: "month",
    Y: "year",
  };
  const unit = units[unitCode];
  if (!unit) return fallback;
  return count === "1" ? unit : `${count} ${unit}s`;
}

function getPlanDisclosure(
  purchasePackage: PurchasesPackage,
  fallbackPeriod: string,
): string {
  const product = purchasePackage.product;
  const billingPeriod = formatSubscriptionPeriod(
    product.subscriptionPeriod,
    fallbackPeriod,
  );
  const renewal = `${product.priceString}/${billingPeriod}; auto-renews until canceled.`;
  const introPrice = product.introPrice;

  if (!introPrice) {
    return renewal;
  }

  const introUnits: Record<string, string> = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
  };
  const introUnit = introUnits[introPrice.periodUnit] ?? "billing period";
  const introDurationCount = introPrice.periodNumberOfUnits * introPrice.cycles;
  const durationInDays =
    introPrice.periodUnit === "WEEK"
      ? introDurationCount * 7
      : introPrice.periodUnit === "DAY"
        ? introDurationCount
        : null;
  const introDuration = durationInDays
    ? `${durationInDays}-day`
    : `${introDurationCount}-${introUnit}`;
  const introOffer =
    introPrice.price === 0
      ? `${introDuration} free trial`
      : `${introPrice.priceString} for ${introDuration}`;

  return `Eligible new subscribers: ${introOffer}, then ${renewal}`;
}

export default function ReadingSprintScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tab, setTab] = useState<SprintTab>("today");
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revenueCat, setRevenueCat] = useState(initialRevenueCatState);
  const [revenueCatError, setRevenueCatError] = useState("");
  const [purchaseBusy, setPurchaseBusy] = useState<PurchaseAction | null>(null);
  const [session, setSession] = useState<ReadingSprintSession | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength>(15);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const paywallImpressionTracked = useRef(false);

  const refreshLocalState = useCallback(async () => {
    const [savedArticles, count, storedSession, reminderId] = await Promise.all([
      getReadingSprintStories(),
      getReadingSprintDailyCount(),
      getReadingSprintSession(),
      AsyncStorage.getItem(READING_SPRINT_REMINDER_KEY),
    ]);
    setArticles(savedArticles);
    setDailyCount(count);
    setSession(storedSession);
    setReminderEnabled(Boolean(reminderId));
  }, []);

  const refreshRevenueCat = useCallback(async () => {
    setRevenueCatError("");
    try {
      setRevenueCat(await getRevenueCatState());
    } catch (error) {
      console.error("Error loading RevenueCat state:", error);
      setRevenueCatError("RevenueCat could not load plans. Check its store setup and try again.");
      setRevenueCat(initialRevenueCatState);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      paywallImpressionTracked.current = false;
      setLoading(true);
      void Promise.all([refreshLocalState(), refreshRevenueCat()])
        .catch((error) => {
          console.error("Error loading Reading Sprint:", error);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [refreshLocalState, refreshRevenueCat]),
  );

  useEffect(() => {
    if (
      loading ||
      revenueCat.isPremium ||
      localDebugPremiumEnabled ||
      !isRevenueCatAvailable() ||
      paywallImpressionTracked.current
    ) {
      return;
    }

    paywallImpressionTracked.current = true;
    void trackReadingSprintPaywallImpression().catch((error) => {
      console.error("Error tracking RevenueCat paywall impression:", error);
    });
  }, [loading, revenueCat.isPremium]);

  useEffect(() => {
    if (!session) {
      setRemainingSeconds(0);
      return;
    }

    let finishing = false;
    const tick = () => {
      const endAt = session.startedAt + session.durationMinutes * 60_000;
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !finishing) {
        finishing = true;
        void clearReadingSprintSession().then(() => {
          setSession(null);
          Alert.alert("Sprint complete", "Your reading session is complete.");
        });
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const todayArticles = useMemo(
    () => articles.filter((article) => article.readingSprintStatus === "today"),
    [articles],
  );
  const laterArticles = useMemo(
    () => articles.filter((article) => article.readingSprintStatus === "later"),
    [articles],
  );
  const readArticles = useMemo(
    () => articles.filter((article) => article.readingSprintStatus === "read"),
    [articles],
  );
  const unassignedArticles = useMemo(
    () => articles.filter((article) => !article.readingSprintStatus),
    [articles],
  );
  const visibleArticles =
    tab === "today"
      ? todayArticles
      : tab === "later"
        ? laterArticles
        : tab === "read"
          ? readArticles
          : unassignedArticles;

  const updateStatus = async (
    articleId: number,
    status: ReadingSprintStatus | null,
  ) => {
    const result = await setReadingSprintStatus(articleId, status);
    if (!result.ok) {
      Alert.alert(
        result.reason === "daily-limit" ? "Today's limit reached" : "Story unavailable",
        result.reason === "daily-limit"
          ? `You can add up to ${READING_SPRINT_DAILY_LIMIT} links to Today each day. Move one to Later or Read first.`
          : "Save this story to Bookmarks before adding it to Reading Sprint.",
      );
      return;
    }
    await refreshLocalState();
  };

  const openArticle = async (article: Article) => {
    if (article.url) {
      await WebBrowser.openBrowserAsync(article.url);
    } else if (article.text) {
      router.push(`/post/${article.id}`);
    }
  };

  const startSession = async () => {
    const nextSession: ReadingSprintSession = {
      durationMinutes: sessionLength,
      startedAt: Date.now(),
    };
    await saveReadingSprintSession(nextSession);
    setSession(nextSession);
  };

  const stopSession = async () => {
    await clearReadingSprintSession();
    setSession(null);
  };

  const toggleReminder = async () => {
    try {
      if (reminderEnabled) {
        const notificationId = await AsyncStorage.getItem(READING_SPRINT_REMINDER_KEY);
        if (notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        await AsyncStorage.removeItem(READING_SPRINT_REMINDER_KEY);
        setReminderEnabled(false);
        return;
      }

      if (Platform.OS === "web") {
        Alert.alert("Not available", "Daily reminders are available in the mobile app.");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reading-sprint", {
          name: "Reading Sprint",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      let permission = await Notifications.getPermissionsAsync();
      if (permission.status !== "granted") {
        permission = await Notifications.requestPermissionsAsync();
      }
      if (permission.status !== "granted") {
        Alert.alert("Notifications are off", "Allow notifications to turn on the reminder.");
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for a Reading Sprint",
          body: "Pick a few saved stories and make time to read.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
          ...(Platform.OS === "android" ? { channelId: "reading-sprint" } : {}),
        },
      });
      await AsyncStorage.setItem(READING_SPRINT_REMINDER_KEY, notificationId);
      setReminderEnabled(true);
    } catch (error) {
      console.error("Error changing Reading Sprint reminder:", error);
      Alert.alert("Reminder unavailable", "The daily reminder could not be changed.");
    }
  };

  const handlePurchase = async (
    item: PurchasesPackage,
    plan: "monthly" | "annual",
  ) => {
    setPurchaseBusy(plan);
    try {
      const isPremium = await purchaseReadingSprint(item);
      await refreshRevenueCat();
      if (!isPremium) {
        Alert.alert("Purchase not active", "The Reading Sprint entitlement was not returned.");
      }
    } catch (error) {
      console.error("Reading Sprint purchase failed:", error);
      Alert.alert("Purchase unavailable", "The store could not complete the purchase. Try again later.");
    } finally {
      setPurchaseBusy(null);
    }
  };

  const handleRestore = async () => {
    setPurchaseBusy("restore");
    try {
      const restored = await restoreReadingSprintPurchases();
      await refreshRevenueCat();
      Alert.alert(
        restored ? "Subscription restored" : "No subscription found",
        restored
          ? "Reading Sprint premium access is active."
          : "No active Reading Sprint subscription was found for this store account.",
      );
    } catch (error) {
      console.error("Could not restore Reading Sprint purchases:", error);
      Alert.alert("Restore unavailable", "Purchases could not be restored right now.");
    } finally {
      setPurchaseBusy(null);
    }
  };

  const openLegalLink = (url: string) => {
    void Linking.openURL(url).catch((error) => {
      console.error("Could not open subscription information link:", error);
      Alert.alert("Link unavailable", "Please try again later.");
    });
  };

  const renderArticle = (article: Article) => {
    const actions: ReadingSprintStatus[] =
      tab === "saved"
        ? ["today", "later"]
        : tab === "today"
          ? ["later", "read"]
          : tab === "later"
            ? ["today", "read"]
            : ["today", "later"];

    return (
      <View
        key={article.id}
        className="mb-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <TouchableOpacity onPress={() => void openArticle(article)}>
          <Text className="text-base font-semibold text-zinc-900 dark:text-white">
            {article.title || `Hacker News story ${article.id}`}
          </Text>
          <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {article.by ? `by ${article.by}` : "Saved story"}
          </Text>
        </TouchableOpacity>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {actions.map((action) => (
            <TouchableOpacity
              key={action}
              onPress={() => void updateStatus(article.id, action)}
              className="rounded-full bg-orange-600 px-3 py-2"
            >
              <Text className="text-xs font-semibold capitalize text-white">
                {action === "today" ? "Today" : action === "later" ? "Later" : "Read"}
              </Text>
            </TouchableOpacity>
          ))}
          {tab !== "saved" && (
            <TouchableOpacity
              onPress={() => void updateStatus(article.id, null)}
              className="rounded-full bg-zinc-200 px-3 py-2 dark:bg-zinc-700"
            >
              <Text className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Remove from sprint
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const monthlyPackage = planPackage(revenueCat.packages, "monthly");
  const annualPackage = planPackage(revenueCat.packages, "annual");
  const hasPremiumAccess = revenueCat.isPremium || localDebugPremiumEnabled;

  if (loading) {
    return (
      <>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </>
    );
  }

  if (!hasPremiumAccess) {
    const canOfferPurchase = revenueCat.configured && !revenueCatError;
    return (
      <>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ScrollView
          className="flex-1 bg-white px-5 py-6 dark:bg-zinc-900"
          contentInsetAdjustmentBehavior="automatic"
        >
        <Text className="text-base text-zinc-600 dark:text-zinc-300">
          A focused queue for your saved stories, with daily reading sessions.
        </Text>
        <View className="mt-6 rounded-2xl bg-orange-50 p-5 dark:bg-orange-900/20">
          <Text className="text-xl font-bold text-zinc-900 dark:text-white">
            Reading Sprint Premium
          </Text>
          <Text className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
            Organize saved stories into Today, Later, and Read; choose a 5, 15, or 30-minute session; and optionally set a daily reminder.
          </Text>
          <Text className="mt-3 text-xs leading-4 text-zinc-600 dark:text-zinc-300">
            RevenueCat processes subscription purchases and anonymous paywall-view analytics using a random app ID. See the Privacy Policy below.
          </Text>
          {!isRevenueCatAvailable() && (
            <Text className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              RevenueCat setup is not finished for this build. Add the iOS and Android public SDK keys as EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY, then create a new native development build.
            </Text>
          )}
          {revenueCatError ? (
            <Text className="mt-3 text-sm text-red-600 dark:text-red-400">{revenueCatError}</Text>
          ) : null}
          {canOfferPurchase && !monthlyPackage && !annualPackage && (
            <Text className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              Add monthly and annual products to the current RevenueCat offering to show purchase options here.
            </Text>
          )}
          {monthlyPackage && (
            <TouchableOpacity
              disabled={purchaseBusy !== null}
              onPress={() => void handlePurchase(monthlyPackage, "monthly")}
              className="mt-5 rounded-lg bg-orange-600 px-4 py-3"
            >
              <Text className="text-center font-semibold text-white">
                {purchaseBusy === "monthly" ? "Processing…" : `Monthly · ${monthlyPackage.product.priceString}`}
              </Text>
            </TouchableOpacity>
          )}
          {annualPackage && (
            <TouchableOpacity
              disabled={purchaseBusy !== null}
              onPress={() => void handlePurchase(annualPackage, "annual")}
              className="mt-3 rounded-lg bg-orange-600 px-4 py-3"
            >
              <Text className="text-center font-semibold text-white">
                {purchaseBusy === "annual" ? "Processing…" : `Annual · ${annualPackage.product.priceString}`}
              </Text>
            </TouchableOpacity>
          )}
          {(monthlyPackage || annualPackage) && (
            <View className="mt-4 rounded-lg bg-white/70 px-3 py-2 dark:bg-zinc-900/60">
              <Text className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Subscription details
              </Text>
              {monthlyPackage && (
                <Text className="mt-1 text-xs leading-4 text-zinc-600 dark:text-zinc-300">
                  Monthly: {getPlanDisclosure(monthlyPackage, "month")}
                </Text>
              )}
              {annualPackage && (
                <Text className="mt-1 text-xs leading-4 text-zinc-600 dark:text-zinc-300">
                  Annual: {getPlanDisclosure(annualPackage, "year")}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity
            disabled={purchaseBusy !== null || !canOfferPurchase}
            onPress={() => void handleRestore()}
            className="mt-4 py-3"
          >
            <Text className="text-center font-medium text-orange-700 dark:text-orange-300">
              {purchaseBusy === "restore" ? "Restoring…" : "Restore purchases"}
            </Text>
          </TouchableOpacity>
          <View className="mt-3 flex-row justify-center gap-5">
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => openLegalLink(PRIVACY_POLICY_URL)}
            >
              <Text className="text-sm text-orange-700 dark:text-orange-300">
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => openLegalLink(TERMS_OF_USE_URL)}
            >
              <Text className="text-sm text-orange-700 dark:text-orange-300">
                Terms of Use
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </>
    );
  }

  return (
    <>
    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    <ScrollView
      className="flex-1 bg-white px-4 py-5 dark:bg-zinc-900"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Your queue is stored on this device. Bookmarked stories stay available in the free reader.
      </Text>

      {localDebugPremiumEnabled && (
        <Text className="mt-3 self-start rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          Local debug mode · premium unlocked
        </Text>
      )}

      <View className="mt-5 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
          Reading session
        </Text>
        {session ? (
          <>
            <Text className="my-3 text-center text-5xl font-bold tabular-nums text-orange-600">
              {formatTime(remainingSeconds)}
            </Text>
            <Text className="text-center text-sm text-zinc-600 dark:text-zinc-300">
              {session.durationMinutes}-minute session in progress
            </Text>
            <TouchableOpacity
              onPress={() => void stopSession()}
              className="mt-4 rounded-lg bg-zinc-700 px-4 py-3 dark:bg-zinc-600"
            >
              <Text className="text-center font-semibold text-white">End session</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="mt-3 flex-row justify-between gap-2">
              {SESSION_LENGTHS.map((length) => (
                <TouchableOpacity
                  key={length}
                  onPress={() => setSessionLength(length)}
                  className={`flex-1 rounded-lg px-2 py-3 ${sessionLength === length ? "bg-orange-600" : "bg-white dark:bg-zinc-700"}`}
                >
                  <Text className={`text-center font-semibold ${sessionLength === length ? "text-white" : "text-zinc-700 dark:text-zinc-200"}`}>
                    {length} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => void startSession()}
              className="mt-3 rounded-lg bg-orange-600 px-4 py-3"
            >
              <Text className="text-center font-semibold text-white">Start session</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={() => void toggleReminder()}
        className="mt-4 flex-row items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <View className="flex-1 pr-3">
          <Text className="font-semibold text-zinc-900 dark:text-white">
            Daily reminder · 9:00 AM
          </Text>
          <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {reminderEnabled ? "On · tap to turn off" : "Optional · tap to turn on"}
          </Text>
        </View>
        <Text className="font-semibold text-orange-600 dark:text-orange-400">
          {reminderEnabled ? "On" : "Off"}
        </Text>
      </TouchableOpacity>

      <View className="mt-6">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
          Today's links: {dailyCount}/{READING_SPRINT_DAILY_LIMIT}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {([
            ["today", `Today ${todayArticles.length}`],
            ["later", `Later ${laterArticles.length}`],
            ["read", `Read ${readArticles.length}`],
            ["saved", `Add saved ${unassignedArticles.length}`],
          ] as [SprintTab, string][]).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setTab(value)}
              className={`mr-2 rounded-full px-4 py-2 ${tab === value ? "bg-orange-600" : "bg-zinc-100 dark:bg-zinc-800"}`}
            >
              <Text className={`font-medium ${tab === value ? "text-white" : "text-zinc-700 dark:text-zinc-200"}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {visibleArticles.length ? (
          <View className="mt-4">{visibleArticles.map(renderArticle)}</View>
        ) : (
          <View className="my-8 items-center rounded-xl bg-zinc-50 px-5 py-8 dark:bg-zinc-800">
            <Text className="text-center text-zinc-600 dark:text-zinc-300">
              {tab === "saved"
                ? "No unassigned bookmarks. Save stories in the free reader, then add them here."
                : `No stories in ${tab === "today" ? "Today" : tab === "later" ? "Later" : "Read"} yet.`}
            </Text>
            {tab === "saved" && (
              <TouchableOpacity onPress={() => router.push("/(tabs)/bookmarks")} className="mt-4">
                <Text className="font-semibold text-orange-600 dark:text-orange-400">Open Bookmarks</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => void handleRestore()} className="mb-10 mt-6 py-3">
        <Text className="text-center font-medium text-orange-700 dark:text-orange-300">
          Restore purchases
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </>
  );
}
