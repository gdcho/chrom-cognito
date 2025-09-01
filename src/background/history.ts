export const removeFromHistory = async (url: string) => {
  try {
    console.log(`Attempting to remove from history: ${url}`);

    // First check if the URL exists in history
    const searchResults = await chrome.history.search({
      text: url,
      maxResults: 1,
      startTime: 0,
    });

    if (searchResults.length === 0) {
      console.log(`URL not found in history: ${url}`);
      return;
    }

    // Delete the URL from history
    await chrome.history.deleteUrl({ url });
    console.log(`Successfully removed from history: ${url}`);
  } catch (e) {
    console.error("History delete failed", e);
    // Try alternative approach - delete by search
    try {
      console.log(`Trying alternative history deletion for: ${url}`);
      const searchResults = await chrome.history.search({
        text: url,
        maxResults: 100,
        startTime: 0,
      });

      for (const item of searchResults) {
        if (item.url === url) {
          await chrome.history.deleteUrl({ url: item.url });
          console.log(`Successfully removed from history (alternative): ${url}`);
          break;
        }
      }
    } catch (altError) {
      console.error("Alternative history deletion also failed", altError);
    }
  }
};
