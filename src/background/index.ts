import type { Settings, TransferMode } from "../types";
import { anyRuleMatches } from "./rules";
import { removeFromHistory } from "./history";
import { pushClosed } from "./recentlyClosed";
import {
  handleAlarm,
  initAutoClose,
  trackActivity,
  clearTab,
} from "./autoClose";

const DEFAULT_SETTINGS: Settings = {
  autoIncognitoRules: [],
  removeFromHistoryOnTransfer: false,
  autoCloseMinutes: null,
  domainsExcludedFromAutoClose: [],
  keyboardShortcuts: {
    openCurrentInIncognito: {
      key: "Alt+Shift+I",
      description: "Open current tab in Incognito",
      enabled: true,
    },
    openMatchingTabsInIncognito: {
      key: "Alt+Shift+M",
      description: "Open all matching-rule tabs in Incognito",
      enabled: true,
    },
    openAllTabsInIncognito: {
      key: "Alt+Shift+A",
      description: "Open all tabs in window in Incognito",
      enabled: true,
    },
  },
  modifierClick: {
    enabled: true,
    // Hardcoded to Alt+Shift only - no individual key configuration
  },
};

async function getSettings(): Promise<Settings> {
  const { settings } = await chrome.storage.sync.get("settings");
  const mergedSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };

  // Ensure keyboard shortcuts are properly merged
  if (settings?.keyboardShortcuts) {
    mergedSettings.keyboardShortcuts = {
      ...DEFAULT_SETTINGS.keyboardShortcuts,
      ...settings.keyboardShortcuts,
    };
  }

  return mergedSettings;
}

async function openUrlInIncognito(url: string, removeHistory: boolean) {
  const win = await chrome.windows.create({ incognito: true, url });
  if (removeHistory) await removeFromHistory(url);
  return win;
}

async function transferTab(tabId: number, removeHistory: boolean) {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;
  await openUrlInIncognito(tab.url, removeHistory);
  await chrome.tabs.remove(tabId);
}

async function transferTabs(
  mode: TransferMode,
  removeHistory: boolean,
  rulesOnly = false,
) {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab) return;

  let tabs: chrome.tabs.Tab[] = [];
  if (mode === "current") tabs = [activeTab];
  else if (mode === "allWindow")
    tabs = await chrome.tabs.query({ currentWindow: true });
  else if (mode === "allMatching")
    tabs = await chrome.tabs.query({ currentWindow: true });

  const settings = await getSettings();

  const urls = tabs
    .filter((t) => t.url)
    .filter(
      (t) => !rulesOnly || anyRuleMatches(t.url!, settings.autoIncognitoRules),
    );

  if (!urls.length) return;
  const first = urls.shift()!;
  const win = await openUrlInIncognito(first.url!, removeHistory);
  if (!win || typeof win.id === "undefined") return;
  const incogWindowId = win.id;

  // move others to same incognito window
  for (const t of urls) {
    await chrome.tabs.create({
      windowId: incogWindowId,
      url: t.url,
    });
    if (removeHistory) await removeFromHistory(t.url!);
  }

  // Close originals
  await chrome.tabs.remove(urls.map((t) => t.id!).concat(first.id!));
}

async function enforceAutoRules(
  tabId: number,
  //   changeInfo: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab,
) {
  if (!tab.url || tab.incognito) return;
  const settings = await getSettings();
  if (anyRuleMatches(tab.url, settings.autoIncognitoRules)) {
    await transferTab(tabId, settings.removeFromHistoryOnTransfer);
  }
}

// Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-link-incognito",
    title: "Open link in Incognito",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "open-page-incognito",
    title: "Open this page in Incognito",
    contexts: ["page"],
  });
  initAutoClose();
});

// Context click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await getSettings();
  if (info.menuItemId === "open-link-incognito" && info.linkUrl) {
    await openUrlInIncognito(
      info.linkUrl,
      settings.removeFromHistoryOnTransfer,
    );
  } else if (info.menuItemId === "open-page-incognito" && tab?.id) {
    await transferTab(tab.id, settings.removeFromHistoryOnTransfer);
  }
});

// Commands
chrome.commands.onCommand.addListener(async (cmd) => {
  const settings = await getSettings();

  // Check if the shortcut is enabled before executing
  if (
    cmd === "open-current-in-incognito" &&
    settings.keyboardShortcuts.openCurrentInIncognito.enabled
  ) {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (t?.id) await transferTab(t.id, settings.removeFromHistoryOnTransfer);
  } else if (
    cmd === "open-matching-tabs-in-incognito" &&
    settings.keyboardShortcuts.openMatchingTabsInIncognito.enabled
  ) {
    await transferTabs(
      "allMatching",
      settings.removeFromHistoryOnTransfer,
      true,
    );
  } else if (
    cmd === "open-all-tabs-in-incognito" &&
    settings.keyboardShortcuts.openAllTabsInIncognito.enabled
  ) {
    await transferTabs(
      "allWindow",
      settings.removeFromHistoryOnTransfer,
      false,
    );
  }
});

// Track closes (for Recently Closed)
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  clearTab(tabId);
  if (!removeInfo || !removeInfo.isWindowClosing) {
    // we can't get url in onRemoved -> store in onUpdated/Activated
    // Workaround: we track URLs in memory
  }
});

// Track updates + enforce rules + activity
const tabUrls: Record<number, string> = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) tabUrls[tabId] = changeInfo.url;
  trackActivity(tabId);
  await enforceAutoRules(tabId, tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  trackActivity(activeInfo.tabId);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) tabUrls[activeInfo.tabId] = tab.url;
});

// Keep recently closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const url = tabUrls[tabId];
  if (!url) return;
  const title = ""; // We could store titles similarly
  await pushClosed({ url, title, closedAt: Date.now() });
  delete tabUrls[tabId];
});

// Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "chromcognito-auto-close") {
    const settings = await getSettings();
    await handleAlarm(settings);
  }
});

// Messages (from popup/options/content)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    const settings = await getSettings();
    switch (msg.type) {
      case "GET_SETTINGS":
        sendResponse(settings);
        break;
      case "SAVE_SETTINGS":
        await chrome.storage.sync.set({ settings: msg.payload });
        sendResponse(true);
        break;
      case "TRANSFER":
        await transferTabs(
          msg.mode as TransferMode,
          settings.removeFromHistoryOnTransfer,
          msg.rulesOnly,
        );
        sendResponse(true);
        break;
      case "GET_RECENTLY_CLOSED":
        sendResponse(
          await (await import("./recentlyClosed")).getRecentlyClosed(),
        );
        break;
      case "OPEN_WITH_MODIFIER":
        await openUrlInIncognito(
          msg.url,
          (
            await getSettings()
          ).removeFromHistoryOnTransfer,
        );
        sendResponse(true);
        break;
      case "OPEN_INCOGNITO": {
        const settings = await getSettings(); // if you have that helper
        await openUrlInIncognito(msg.url, settings.removeFromHistoryOnTransfer);
        sendResponse(true);
        break;
      }
      default:
        break;
    }
  })();
  return true; // async
});
