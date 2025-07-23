export type Rule = {
  pattern: string;
  useRegex: boolean;
};

export type Settings = {
  autoIncognitoRules: Rule[];
  removeFromHistoryOnTransfer: boolean;
  autoCloseMinutes: number | null;
  domainsExcludedFromAutoClose: string[];
};

export type RecentlyClosedTab = {
  url: string;
  title: string;
  closedAt: number;
};

export type TransferMode = "current" | "allMatching" | "allWindow";
