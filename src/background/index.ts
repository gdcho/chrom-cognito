import type { Settings, TransferMode } from "../types";
import { anyRuleMatches } from "./rules";
import { removeFromHistory } from "./history";
import { pushClosed } from "./recentlyClosed";
import {
  trackActivity,
  clearTab,
} from "./autoClose";

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
  console.log(`ChromCognito: URLs to transfer:`, urlStrings);

  // Use the new approach that creates individual incognito windows
  const incogWindow = await openMultipleUrlsInIncognito(
    urlStrings,
    removeHistory,
  );

  if (incogWindow) {
    console.log(
      `ChromCognito: Successfully created incognito windows with all tabs`,
    );

    // Close original tabs only if we successfully created the incognito windows
    try {
      console.log(`ChromCognito: Closing ${urls.length} original tabs`);
      await chrome.tabs.remove(urls.map((t) => t.id!));
      console.log(`ChromCognito: Successfully closed all original tabs`);
    } catch (error) {
      console.error("ChromCognito: Failed to remove original tabs:", error);
    }
  } else {
    console.error(
      `ChromCognito: Failed to create incognito windows, not closing originals`,
    );
  }
}

// Revolutionary approach: Create individual incognito tabs and group them
async function openMultipleUrlsInIncognito(
  urls: string[],
  removeHistory: boolean,
) {
  console.log(
    `ChromCognito: Opening ${urls.length} URLs in individual incognito tabs`,
  );

  // Filter out URLs that can't be opened in incognito mode
  const validUrls = urls.filter((url) => {
    if (!url) return false;
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
      console.log(`ChromCognito: Skipping Chrome internal URL: ${url}`);
      return false;
    }
    if (url === "about:blank" || url === "chrome://newtab/") {
      console.log(`ChromCognito: Skipping invalid URL: ${url}`);
      return false;
    }
    return true;
  });

  console.log(
    `ChromCognito: Filtered to ${validUrls.length} valid URLs:`,
    validUrls,
  );

  if (validUrls.length === 0) {
    console.error(`ChromCognito: No valid URLs to open in incognito mode`);
    return null;
  }

  try {
    console.log(
      `ChromCognito: Using NEW approach - creating individual incognito windows for each tab`,
    );

    const createdWindows: chrome.windows.Window[] = [];
    const createdTabs: chrome.tabs.Tab[] = [];

    // Create individual incognito windows for each URL
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      try {
        console.log(
          `ChromCognito: Creating incognito window ${i + 1}/${
            validUrls.length
          } with URL: ${url}`,
        );

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
          console.log(
            `ChromCognito: Successfully created incognito window ${newWindow.id} with tab ${newTab.id}`,
          );
        } else {
          console.error(
            `ChromCognito: Failed to create incognito window for ${url}`,
          );
        }

        if (removeHistory) {
          // Add a small delay to ensure the history entry is created first
          setTimeout(async () => {
            try {
              await removeFromHistory(url);
              console.log(`ChromCognito: Removed from history: ${url}`);
            } catch (error) {
              console.error(
                `ChromCognito: Failed to remove from history: ${url}`,
                error,
              );
            }
          }, 1000);
        }

        // Small delay between window creations
        if (i < validUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `ChromCognito: Failed to create incognito window for ${url}:`,
          error,
        );
      }
    }

    console.log(
      `ChromCognito: Successfully created ${createdWindows.length} incognito windows`,
    );

    // Return a mock window object for compatibility (using the first window as reference)
    if (createdWindows.length > 0) {
      const firstWindow = createdWindows[0];
      const mockWindow = {
        id: firstWindow.id,
        incognito: true,
        tabs: createdTabs,
      };
      console.log(`ChromCognito: Returning mock window object:`, mockWindow);
      return mockWindow;
    } else {
      console.log(`ChromCognito: No windows created, returning null`);
      return null;
    }
  } catch (error) {
    console.error(
      `ChromCognito: Failed to open multiple URLs in incognito:`,
      error,
    );
    return null;
  }
}

// Batch processing for auto-rules to group matching tabs together
let pendingRuleMatches: Array<{ tabId: number; tab: chrome.tabs.Tab }> = [];
let ruleMatchTimeout: NodeJS.Timeout | null = null;

async function processBatchRuleMatches() {
  if (pendingRuleMatches.length === 0) return;

  const settings = await getSettings();
  if (!settings.autoIncognitoEnabled) {
    pendingRuleMatches = [];
    return;
  }

  // Filter to only include tabs that still match rules (in case they were changed)
  const validMatches = pendingRuleMatches.filter(
    ({ tab }) =>
      tab.url &&
      !tab.incognito &&
      anyRuleMatches(tab.url, settings.autoIncognitoRules),
  );

  if (validMatches.length === 0) {
    pendingRuleMatches = [];
    return;
  }

  console.log(
    `ChromCognito: Processing batch of ${validMatches.length} rule-matching tabs`,
  );

  // Use the existing transferTabs logic to open all in the same incognito window
  const tabIds = validMatches.map(({ tabId }) => tabId);

  // Get the actual tab objects
  const tabs = await Promise.all(tabIds.map((id) => chrome.tabs.get(id)));

  // Filter out any tabs that might have been closed or changed
  const validTabs = tabs.filter((t) => t.url && !t.incognito);

  if (validTabs.length === 0) {
    pendingRuleMatches = [];
    return;
  }

  // Create a single incognito window with the first tab
  const firstTab = validTabs[0];
  const win = await openUrlInIncognito(
    firstTab.url!,
    settings.removeFromHistoryOnTransfer,
  );
  if (!win || typeof win.id === "undefined") {
    pendingRuleMatches = [];
    return;
  }

  const incogWindowId = win.id;

  // Add remaining tabs to the same incognito window
  for (let i = 1; i < validTabs.length; i++) {
    const tab = validTabs[i];
    try {
      await chrome.tabs.create({
        windowId: incogWindowId,
        url: tab.url,
      });
      if (settings.removeFromHistoryOnTransfer) {
        // Add a small delay to ensure the history entry is created first
        setTimeout(async () => {
          await removeFromHistory(tab.url!);
        }, 1000);
      }
    } catch (error) {
      console.error(
        `ChromCognito: Failed to add tab ${tab.url} to incognito window:`,
        error,
      );
    }
  }

  // Close all original tabs
  try {
    await chrome.tabs.remove(tabIds);
  } catch (error) {
    console.error("ChromCognito: Failed to remove original tabs:", error);
  }

  // Clear the batch
  pendingRuleMatches = [];
}

function scheduleBatchRuleMatches(tabId: number, tab: chrome.tabs.Tab) {
  console.log(
    `ChromCognito: Scheduling batch for tab ${tabId} with URL: ${tab.url}`,
  );

  // Check if this tab matches any rules
  getSettings().then((settings) => {
    const matches = anyRuleMatches(tab.url!, settings.autoIncognitoRules);
    console.log(`ChromCognito: Tab ${tabId} matches rules: ${matches}`);
    if (matches) {
      console.log(
        `ChromCognito: Rules that match:`,
        settings.autoIncognitoRules.filter((rule) =>
          anyRuleMatches(tab.url!, [rule]),
        ),
      );
    }
  });

  // Add to pending batch
  pendingRuleMatches.push({ tabId, tab });

  console.log(`ChromCognito: Current batch size: ${pendingRuleMatches.length}`);
  console.log(
    `ChromCognito: Current batch tabs:`,
    pendingRuleMatches.map(({ tabId, tab }) => ({ tabId, url: tab.url })),
  );

  // Clear existing timeout
  if (ruleMatchTimeout) {
    clearTimeout(ruleMatchTimeout);
  }

  // Schedule processing after a short delay to group multiple tabs
  ruleMatchTimeout = setTimeout(() => {
    console.log(
      `ChromCognito: Processing batch timeout triggered with ${pendingRuleMatches.length} tabs`,
    );
    processBatchRuleMatches();
  }, 500); // Increased delay to 500ms to better group tabs opened around the same time
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

// Track all tabs when they're created
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url) {
    tabUrls[tab.id!] = { url: tab.url, incognito: tab.incognito };
    console.log(`Tab created: ${tab.id}, incognito: ${tab.incognito}, url: ${tab.url}`);
  }


});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    tabUrls[tabId] = { url: changeInfo.url, incognito: tab.incognito };
    console.log(`Tab updated: ${tabId}, incognito: ${tab.incognito}, url: ${changeInfo.url}`);
  }
  trackActivity(tabId);

  // Use batching for auto-rules instead of immediate processing
  if (changeInfo.url && tab.url && !tab.incognito) {
    scheduleBatchRuleMatches(tabId, tab);
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
      console.log(`Initial tab: ${tab.id}, incognito: ${tab.incognito}, url: ${tab.url}`);
    }
  }
});

// Handle window closing to capture all tabs in the window
chrome.windows.onRemoved.addListener(async (windowId) => {
  console.log(`Window closed: ${windowId}`);

  // Immediately query for all tabs to see if any were in this window
  try {
    const allTabs = await chrome.tabs.query({});
    console.log(`Total tabs after window close: ${allTabs.length}`);

    // Check if any tabs we were tracking are now missing (indicating they were in the closed window)
    const trackedTabIds = Object.keys(tabUrls).map(Number);
    const currentTabIds = allTabs.map((tab) => tab.id).filter((id) => id !== undefined) as number[];

    const missingTabIds = trackedTabIds.filter((id) => !currentTabIds.includes(id));
    console.log(`Missing tab IDs: ${missingTabIds.join(", ")}`);

    // Save any missing incognito tabs
    for (const tabId of missingTabIds) {
      const tabInfo = tabUrls[tabId];
      if (tabInfo && tabInfo.incognito) {
        console.log(`Saving missing incognito tab: ${tabId}, url: ${tabInfo.url}`);
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
  } catch (error) {
    console.log(`Error handling window close: ${error}`);
  }
});

// Keep recently closed
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  clearTab(tabId);

  const tabInfo = tabUrls[tabId];
  if (tabInfo) {
    console.log(`Tab closed: ${tabId}, incognito: ${tabInfo.incognito}, url: ${tabInfo.url}, isWindowClosing: ${removeInfo?.isWindowClosing}`);
    const title = ""; // We could store titles similarly
    await pushClosed({
      url: tabInfo.url,
      title,
      closedAt: Date.now(),
      incognito: tabInfo.incognito,
    });
    delete tabUrls[tabId];
  } else {
    console.log(`Tab closed but no info found: ${tabId}, isWindowClosing: ${removeInfo?.isWindowClosing}`);
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
