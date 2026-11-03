import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const ONBOARDING_KEY = "hasSeenFirstLaunchOnboarding";

export default function FirstLaunchOnboarding({ ready }: { ready: boolean }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void AsyncStorage.getItem(ONBOARDING_KEY)
      .then(async (hasSeen: string | null) => {
        // Preserve onboarding state from older versions that used the newsletter key.
        if (!hasSeen && (await AsyncStorage.getItem("hasSeenNewsletterModal"))) {
          await AsyncStorage.setItem(ONBOARDING_KEY, "true");
          hasSeen = "true";
        }
        if (active && !hasSeen) {
          timer = setTimeout(() => setVisible(true), 600);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not check first-launch onboarding:", error);
      });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [ready]);

  const finish = async (showPremium: boolean) => {
    setVisible(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("Could not save onboarding state:", error);
    }
    if (showPremium) router.push("/reading-sprint");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => void finish(false)}
    >
      <View className="flex-1 items-center justify-center bg-black/55 px-6">
        <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-zinc-900">
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/40">
            <FontAwesome5 name="fire-alt" size={25} color="#f97316" />
          </View>
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
            A calmer way to read Hacker News
          </Text>
          <Text className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-300">
            Browse the stories you care about, save good reads for later, and keep your reading focused.
          </Text>

          <View className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
            <View className="flex-row items-start">
              <FontAwesome5 name="bookmark" size={15} color="#f97316" style={{ marginTop: 3 }} />
              <Text className="ml-3 flex-1 text-sm leading-5 text-zinc-700 dark:text-zinc-200">
                The reader and bookmarks are free to use.
              </Text>
            </View>
            <View className="mt-3 flex-row items-start">
              <FontAwesome5 name="stopwatch" size={15} color="#f97316" style={{ marginTop: 3 }} />
              <Text className="ml-3 flex-1 text-sm leading-5 text-zinc-700 dark:text-zinc-200">
                Reading Sprint Premium adds a daily queue, focus timer, and optional reminder.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void finish(true)}
            className="mt-5 rounded-xl bg-orange-600 px-4 py-4"
          >
            <Text className="text-center font-semibold text-white">
              See Reading Sprint Premium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void finish(false)}
            className="mt-2 rounded-xl px-4 py-3"
          >
            <Text className="text-center font-semibold text-zinc-700 dark:text-zinc-200">
              Start reading for free
            </Text>
          </TouchableOpacity>
          <Text className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
            You can explore Premium or subscribe later in Settings.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
