// Configurable modifier click detection for opening links in incognito
let modifierSettings = {
  enabled: true,
  requireCmd: true,
  requireAlt: true,
  requireShift: false,
  requireCtrl: false,
};

// Load settings from storage
chrome.storage.sync.get("settings", (result) => {
  if (result.settings?.modifierClick) {
    modifierSettings = {
      ...modifierSettings,
      ...result.settings.modifierClick,
    };
  }
});

// Listen for settings updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.settings?.newValue?.modifierClick) {
    modifierSettings = {
      ...modifierSettings,
      ...changes.settings.newValue.modifierClick,
    };
  }
});

// Check if the required modifiers are pressed
function checkModifiers(evt: MouseEvent): boolean {
  if (!modifierSettings.enabled) return false;

  // Check each required modifier
  if (modifierSettings.requireCmd && !evt.metaKey) return false;
  if (modifierSettings.requireAlt && !evt.altKey) return false;
  if (modifierSettings.requireShift && !evt.shiftKey) return false;
  if (modifierSettings.requireCtrl && !evt.ctrlKey) return false;

  // Ensure at least one modifier is required and pressed
  const hasAnyModifier =
    evt.metaKey || evt.altKey || evt.shiftKey || evt.ctrlKey;
  const requiresAnyModifier =
    modifierSettings.requireCmd ||
    modifierSettings.requireAlt ||
    modifierSettings.requireShift ||
    modifierSettings.requireCtrl;

  return hasAnyModifier && requiresAnyModifier;
}

// Detect configurable modifier clicks on links
document.addEventListener(
  "click",
  (e) => {
    const evt = e as MouseEvent;

    // Check if the required modifier combination is pressed
    if (!checkModifiers(evt)) return;

    const el = evt.target as HTMLElement | null;
    const anchor = el?.closest("a[href]") as HTMLAnchorElement | null;

    // Handle both links and current page
    const rawUrl = anchor?.href ?? window.location.href;
    if (!rawUrl) return;

    // Stop normal behavior (like opening in new tab)
    evt.preventDefault();
    evt.stopPropagation();

    // Send message to background script to open in incognito
    chrome.runtime.sendMessage({ type: "OPEN_INCOGNITO", url: rawUrl });
  },
  true, // capture to beat site handlers
);
