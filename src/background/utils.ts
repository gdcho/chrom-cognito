// src/background/utils.ts  (or src/shared/utils.ts)
import type { Rule, Settings } from "../types";

export const DEFAULT_SETTINGS: Settings = {
  autoIncognitoRules: [],
  autoIncognitoEnabled: true,
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

export const storage = {
  sync: chrome.storage.sync,
  session: chrome.storage.session ?? chrome.storage.local,
};

export const getSettings = async (): Promise<Settings> => {
  const { settings } = await storage.sync.get("settings");
  const mergedSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };

  // Ensure keyboard shortcuts are properly merged
  if (settings?.keyboardShortcuts) {
    mergedSettings.keyboardShortcuts = {
      ...DEFAULT_SETTINGS.keyboardShortcuts,
      ...settings.keyboardShortcuts,
    };
  }

  return mergedSettings;
};

export const saveSettings = (s: Settings) => storage.sync.set({ settings: s });

export const wildcardToRegex = (pattern: string) =>
  new RegExp(
    "^" +
      pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
      "$",
  );

export const ruleMatches = (url: string, rule: Rule): boolean =>
  rule.useRegex
    ? new RegExp(rule.pattern).test(url)
    : wildcardToRegex(rule.pattern).test(url);

export const tryRemoveFromHistory = async (url: string) => {
  try {
    await chrome.history.deleteUrl({ url });
  } catch {
    /* empty */
  }
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
