import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "./types";
import { getStorySaved } from "./lib";

export type ReadingSprintStatus = "today" | "later" | "read";
export type ReadingSprintSession = {
  durationMinutes: 5 | 15 | 30;
  startedAt: number;
};
export type SprintStatusResult =
  | { ok: true }
  | { ok: false; reason: "not-bookmarked" | "daily-limit" };

export const READING_SPRINT_DAILY_LIMIT = 3;
export const READING_SPRINT_SESSION_KEY = "readingSprintSession";
export const READING_SPRINT_REMINDER_KEY = "readingSprintReminderNotificationId";

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getReadingSprintStories(): Promise<Article[]> {
  const stories = await getStorySaved();
  const today = localDateKey();
  let changed = false;

  // Carry unfinished items forward instead of leaving yesterday's links in Today.
  for (const story of stories) {
    if (
      story.readingSprintStatus === "today" &&
      story.readingSprintTodayDate !== today
    ) {
      story.readingSprintStatus = "later";
      changed = true;
    }
  }

  if (changed) {
    await AsyncStorage.setItem("savedArticles", JSON.stringify(stories));
  }

  return stories.sort((a, b) => (b.time || 0) - (a.time || 0));
}

export async function getReadingSprintDailyCount(): Promise<number> {
  const today = localDateKey();
  const stories = await getStorySaved();
  return stories.filter((story) => story.readingSprintTodayDate === today).length;
}

export async function setReadingSprintStatus(
  articleId: number,
  status: ReadingSprintStatus | null,
): Promise<SprintStatusResult> {
  const stories = await getStorySaved();
  const index = stories.findIndex((story) => story.id === articleId);
  if (index < 0) return { ok: false, reason: "not-bookmarked" };

  const today = localDateKey();
  const article = { ...stories[index] };

  if (status === "today" && article.readingSprintTodayDate !== today) {
    const usedToday = stories.filter(
      (story) => story.readingSprintTodayDate === today,
    ).length;
    if (usedToday >= READING_SPRINT_DAILY_LIMIT) {
      return { ok: false, reason: "daily-limit" };
    }
    article.readingSprintTodayDate = today;
  }

  if (status === null) {
    delete article.readingSprintStatus;
  } else {
    article.readingSprintStatus = status;
  }

  stories[index] = article;
  await AsyncStorage.setItem("savedArticles", JSON.stringify(stories));
  return { ok: true };
}

export async function getReadingSprintSession(): Promise<ReadingSprintSession | null> {
  try {
    const value = await AsyncStorage.getItem(READING_SPRINT_SESSION_KEY);
    return value ? (JSON.parse(value) as ReadingSprintSession) : null;
  } catch (error) {
    console.error("Error loading Reading Sprint session:", error);
    return null;
  }
}

export async function saveReadingSprintSession(
  session: ReadingSprintSession,
): Promise<void> {
  await AsyncStorage.setItem(READING_SPRINT_SESSION_KEY, JSON.stringify(session));
}

export async function clearReadingSprintSession(): Promise<void> {
  await AsyncStorage.removeItem(READING_SPRINT_SESSION_KEY);
}
