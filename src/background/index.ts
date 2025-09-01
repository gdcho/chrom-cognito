import type { Settings, TransferMode } from "../types";
import { anyRuleMatches } from "./rules";
import { removeFromHistory } from "./history";
import { pushClosed } from "./recentlyClosed";
import { trackActivity, clearTab } from "./autoClose";

const DEFAULT_SETTINGS: Settings = {
  autoIncognitoRules: [],
  autoIncognitoEnabled: true,
  removeFromHistoryOnTransfer: false,
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
  if (removeHistory) {
    // Add a small delay to ensure the history entry is created first
    setTimeout(async () => {
      await removeFromHistory(url);
    }, 1000);
  }
  return win;
}

async function redirectTabToIncognito(
  tabId: number,
  url: string,
  removeHistory: boolean,
) {
  // Prevent duplicate redirects
  if (redirectingTabs.has(tabId)) {
    return;
  }

  redirectingTabs.add(tabId);

  try {
    // Create incognito tab first
    await openUrlInIncognito(url, removeHistory);

    // Then close the original tab
    try {
      await chrome.tabs.remove(tabId);
    } catch {
      // Silent error handling
    }
  } finally {
    // Always clean up the tracking
    redirectingTabs.delete(tabId);
  }
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

  // Extract URLs for the new approach
  const urlStrings = urls.map((t) => t.url!);

  // Use the new approach that creates individual incognito windows
  const incogWindow = await openMultipleUrlsInIncognito(
    urlStrings,
    removeHistory,
  );

  if (incogWindow) {
    // Close original tabs only if we successfully created the incognito windows
    try {
      await chrome.tabs.remove(urls.map((t) => t.id!));
    } catch {
      // Silent error handling
    }
  }
}

// Revolutionary approach: Create individual incognito tabs and group them
async function openMultipleUrlsInIncognito(
  urls: string[],
  removeHistory: boolean,
) {
  // Filter out URLs that can't be opened in incognito mode
  const validUrls = urls.filter((url) => {
    if (!url) return false;
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
      return false;
    }
    if (url === "about:blank" || url === "chrome://newtab/") {
      return false;
    }
    return true;
  });

  if (validUrls.length === 0) {
    return null;
  }

  try {
    const createdWindows: chrome.windows.Window[] = [];
    const createdTabs: chrome.tabs.Tab[] = [];

    // Create individual incognito windows for each URL
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      try {
        // Create a new incognito window for each URL
        const newWindow = await chrome.windows.create({
          incognito: true,
          url: url,
          state: "normal",
        });

        if (newWindow && newWindow.tabs && newWindow.tabs.length > 0) {
          const newTab = newWindow.tabs[0];
          createdWindows.push(newWindow);
          createdTabs.push(newTab);
        }

        if (removeHistory) {
          // Add a small delay to ensure the history entry is created first
          setTimeout(async () => {
            try {
              await removeFromHistory(url);
            } catch {
              // Silent error handling
            }
          }, 1000);
        }

        // Small delay between window creations
        if (i < validUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch {
        // Silent error handling
      }
    }

    // Return a mock window object for compatibility (using the first window as reference)
    if (createdWindows.length > 0) {
      const firstWindow = createdWindows[0];
      const mockWindow = {
        id: firstWindow.id,
        incognito: true,
        tabs: createdTabs,
      };
      return mockWindow;
    } else {
      return null;
    }
  } catch {
    return null;
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

// Track updates + enforce rules + activity
const tabUrls: Record<number, { url: string; incognito: boolean }> = {};
const redirectingTabs = new Set<number>(); // Track tabs being redirected to prevent duplicates

// Track all tabs when they're created
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url) {
    tabUrls[tab.id!] = { url: tab.url, incognito: tab.incognito };
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    tabUrls[tabId] = { url: changeInfo.url, incognito: tab.incognito };
  }
  trackActivity(tabId);

  // Check if this tab should be automatically moved to incognito
  if (changeInfo.url && tab.url && !tab.incognito) {
    const settings = await getSettings();
    if (
      settings.autoIncognitoEnabled &&
      anyRuleMatches(tab.url, settings.autoIncognitoRules)
    ) {
      // Skip if this is a chrome:// or extension:// URL
      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
      ) {
        return;
      }

      // Immediately redirect to incognito instead of batching
      await redirectTabToIncognito(
        tabId,
        tab.url,
        settings.removeFromHistoryOnTransfer,
      );
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  trackActivity(activeInfo.tabId);
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    tabUrls[activeInfo.tabId] = { url: tab.url, incognito: tab.incognito };
  }
});

// Track all existing tabs when the extension starts
chrome.tabs.query({}, (tabs) => {
  for (const tab of tabs) {
    if (tab.id && tab.url) {
      tabUrls[tab.id] = { url: tab.url, incognito: tab.incognito };
    }
  }
});

// Handle window closing to capture all tabs in the window
chrome.windows.onRemoved.addListener(async () => {
  // Immediately query for all tabs to see if any were in this window
  try {
    const allTabs = await chrome.tabs.query({});

    // Check if any tabs we were tracking are now missing (indicating they were in the closed window)
    const trackedTabIds = Object.keys(tabUrls).map(Number);
    const currentTabIds = allTabs
      .map((tab) => tab.id)
      .filter((id) => id !== undefined) as number[];

    const missingTabIds = trackedTabIds.filter(
      (id) => !currentTabIds.includes(id),
    );

    // Save any missing incognito tabs
    for (const tabId of missingTabIds) {
      const tabInfo = tabUrls[tabId];
      if (tabInfo && tabInfo.incognito) {
        await pushClosed({
          url: tabInfo.url,
          title: "",
          closedAt: Date.now(),
          incognito: tabInfo.incognito,
        });
      }
      // Clean up the tracking
      delete tabUrls[tabId];
    }
  } catch {
    // Silent error handling
  }
});

// Keep recently closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  clearTab(tabId);

  const tabInfo = tabUrls[tabId];
  if (tabInfo) {
    const title = ""; // We could store titles similarly
    await pushClosed({
      url: tabInfo.url,
      title,
      closedAt: Date.now(),
      incognito: tabInfo.incognito,
    });
    delete tabUrls[tabId];
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
