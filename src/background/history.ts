export const removeFromHistory = async (url: string) => {
  try {
    await chrome.history.deleteUrl({ url });
  } catch (e) {
    console.warn("History delete failed", e);
  }
};
