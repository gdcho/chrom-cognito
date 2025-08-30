export type Rule = {
  pattern: string;
  useRegex: boolean;
};

export type KeyboardShortcut = {
  key: string;
  description: string;
  enabled: boolean;
};

export type ModifierClickSettings = {
  enabled: boolean;
  // Removed individual modifier key options - hardcoded to Alt+Shift only
};

export type Settings = {
  autoIncognitoRules: Rule[];
  removeFromHistoryOnTransfer: boolean;
  autoCloseMinutes: number | null;
  domainsExcludedFromAutoClose: string[];
  keyboardShortcuts: {
    openCurrentInIncognito: KeyboardShortcut;
    openMatchingTabsInIncognito: KeyboardShortcut;
    openAllTabsInIncognito: KeyboardShortcut;
  };
  modifierClick: ModifierClickSettings;
};

export type RecentlyClosedTab = {
  url: string;
  title: string;
  closedAt: number;
};

export type TransferMode = "current" | "allMatching" | "allWindow";

// Chronow Time Tracking Types

export interface ProjectTag {
  name: string;
  color: string; // hex color code for text
  backgroundColor: string; // hex color code for background
}

export interface TimeEntry {
  id: string;
  projectName: string;
  duration: string; // formatted duration string (e.g., "1:23:45")
  startTime: Date;
  endTime?: Date;
  projectTag?: ProjectTag;
}

export interface DailySession {
  date: string; // ISO date string
  dayName: string; // e.g., "Monday", "Tuesday"
  totalDuration: string; // formatted total duration for the day
  entries: TimeEntry[];
}

export interface AppState {
  activeSession?: TimeEntry;
  todayTotal: string; // formatted total duration for today
  todayEntries: TimeEntry[];
  historicalSessions: DailySession[];
  isLoading: boolean;
}

// Component Props Interfaces

export interface HeaderProps {
  onRefresh: () => void;
  onSettings: () => void;
}

export interface ActiveSessionProps {
  sessionName: string;
  elapsedTime: string; // MM:SS format
  projectTag?: ProjectTag;
  isRecording: boolean;
}

export interface DailySummaryProps {
  totalTime: string; // H:MM:SS format
  date: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface TimeEntryProps {
  projectName: string;
  duration: string;
  projectTag?: ProjectTag;
  startTime?: string; // formatted start time
}

export interface HistoricalSectionProps {
  date: string;
  dayName: string;
  totalTime: string;
  entries: TimeEntry[];
  isExpanded: boolean;
  onToggle: () => void;
}
