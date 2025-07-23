// src/background/utils.ts  (or src/shared/utils.ts)
import type { Rule, Settings } from "../types";

export const DEFAULT_SETTINGS: Settings = {
  autoIncognitoRules: [],
  removeFromHistoryOnTransfer: false,
  autoCloseMinutes: null,
  domainsExcludedFromAutoClose: [],
};

export const storage = {
  sync: chrome.storage.sync,
  session: chrome.storage.session ?? chrome.storage.local,
};

export const getSettings = async (): Promise<Settings> => {
  const { settings } = await storage.sync.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
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
