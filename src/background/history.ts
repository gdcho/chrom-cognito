export const removeFromHistory = async (url: string) => {
  try {
    // First check if the URL exists in history
    const searchResults = await chrome.history.search({
      text: url,
      maxResults: 1,
      startTime: 0,
    });

    if (searchResults.length === 0) {
      return;
    }

    // Delete the URL from history
    await chrome.history.deleteUrl({ url });
  } catch {
    // Try alternative approach - delete by search
    try {
      const searchResults = await chrome.history.search({
        text: url,
        maxResults: 100,
        startTime: 0,
      });

      for (const item of searchResults) {
        if (item.url === url) {
          await chrome.history.deleteUrl({ url: item.url });
          break;
        }
      }
    } catch {
      // Silent error handling
    }
  }
};
