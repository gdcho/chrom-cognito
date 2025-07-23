import type { RecentlyClosedTab } from "../types";

const KEY = "recentlyClosedTabs";

export const pushClosed = async (tab: RecentlyClosedTab) => {
  const store = chrome.storage.session ?? chrome.storage.local;
  const { [KEY]: arr = [] } = await store.get(KEY);
  arr.unshift(tab);
  await store.set({ [KEY]: arr.slice(0, 50) }); // keep last 50
};

export const getRecentlyClosed = async (): Promise<RecentlyClosedTab[]> => {
  const store = chrome.storage.session ?? chrome.storage.local;
  const { [KEY]: arr = [] } = await store.get(KEY);
  return arr;
};
