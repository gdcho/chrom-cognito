// Activity tracking for tabs (kept for potential future use)
const lastActive: Record<number, number> = {}; // tabId -> timestamp

export const trackActivity = (tabId: number) => {
  lastActive[tabId] = Date.now();
};

export const clearTab = (tabId: number) => {
  delete lastActive[tabId];
};
