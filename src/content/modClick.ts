// Detect Cmd+Shift+Click (mac) or Ctrl+Shift+Click (win/linux) on links
document.addEventListener(
  "click",
  (e) => {
    const evt = e as MouseEvent;
    if (!(evt.shiftKey && (evt.metaKey || evt.ctrlKey))) return; // your combo

    const el = evt.target as HTMLElement | null;
    const anchor = el?.closest("a[href]") as HTMLAnchorElement | null;
    const rawUrl = anchor?.href ?? window.location.href;
    if (!rawUrl) return;

    // Stop normal open-in-new-tab behavior
    evt.preventDefault();
    evt.stopPropagation();

    chrome.runtime.sendMessage({ type: "OPEN_INCOGNITO", url: rawUrl });
  },
  true, // capture to beat site handlers
);
