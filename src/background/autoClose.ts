import type { Settings } from "../types";
// import { anyRuleMatches } from "./rules";

const AUTO_CLOSE_ALARM = "chromcognito-auto-close";
const lastActive: Record<number, number> = {}; // tabId -> timestamp

export const trackActivity = (tabId: number) => {
  lastActive[tabId] = Date.now();
};

export const initAutoClose = async () => {
  // create/minutely check
  await chrome.alarms.create(AUTO_CLOSE_ALARM, { periodInMinutes: 1 });
};

export const handleAlarm = async (settings: Settings) => {
  if (!settings.autoCloseMinutes) return;
  const limitMs = settings.autoCloseMinutes * 60 * 1000;

  const allTabs = await chrome.tabs.query({});
  const tabs = allTabs.filter((t) => t.incognito);
  const now = Date.now();

  for (const t of tabs) {
    if (!t.id || !t.url) continue;
    const excluded = settings.domainsExcludedFromAutoClose.some((d) =>
      t.url!.includes(d),
    );
    if (excluded) continue;

    const last = lastActive[t.id] ?? now; // if unknown mark now
    if (now - last > limitMs) {
      chrome.tabs.remove(t.id);
    }
  }
};

export const clearTab = (tabId: number) => {
  delete lastActive[tabId];
};
