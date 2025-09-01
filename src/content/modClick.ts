// Configurable modifier click detection for opening links in incognito

// Add a visual indicator that the script is loaded (for debugging)
declare global {
  interface Window {
    chromCognitoLoaded: boolean;
  }
}

if (typeof window !== "undefined") {
  window.chromCognitoLoaded = true;
}

let modifierSettings = {
  enabled: true,
  // Hardcoded to Alt+Shift only - no individual key configuration
};

// Load settings from storage
if (typeof chrome !== "undefined" && chrome.storage) {
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
} else {
  // Using default settings
}

function checkModifiers(evt: MouseEvent): boolean {
  if (!modifierSettings.enabled) return false;

  // Hardcoded to Alt+Shift only
  return evt.altKey && evt.shiftKey;
}

function handleLinkClick(evt: MouseEvent, eventType: string) {
  // Only care about left-clicks
  if (evt.button !== 0) return;

  if (!checkModifiers(evt)) return;

  // If modifier click is disabled, don't interfere with normal link behavior
  if (!modifierSettings.enabled) {
    return;
  }

  // Find an <a> element in the path
  const path = evt.composedPath ? evt.composedPath() : [];
  const anchor =
    path.find((el) => el && (el as Element).tagName === "A") ||
    (evt.target as Element)?.closest?.("a");
  if (!anchor) return;

  // Must have an href we can read
  const href = (anchor as HTMLAnchorElement).href;
  if (!href) return;

  // Aggressively stop all default behaviors
  evt.preventDefault();
  evt.stopPropagation();
  evt.stopImmediatePropagation();

  // For mousedown, also temporarily remove the href to prevent navigation
  if (eventType === "mousedown") {
    const anchorEl = anchor as HTMLAnchorElement;
    const originalHref = anchorEl.href;
    anchorEl.removeAttribute("href");
    setTimeout(() => {
      anchorEl.href = originalHref;
    }, 100);
  }

  // Send message to background script
  try {
    chrome.runtime.sendMessage({ type: "OPEN_INCOGNITO", url: href });
  } catch {
    // Silent error handling
  }
}

// Function to set up event listeners
function setupEventListeners() {
  // Listen to mousedown first (fires before click and page handlers)
  document.addEventListener(
    "mousedown",
    (evt) => handleLinkClick(evt, "mousedown"),
    { capture: true },
  );

  // Also prevent click events when our modifiers are active to avoid double-triggering
  document.addEventListener(
    "click",
    (evt) => {
      if (checkModifiers(evt) && modifierSettings.enabled) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
      }
    },
    {
      capture: true,
    },
  );

  // Listen to auxclick for middle-click and other buttons
  document.addEventListener(
    "auxclick",
    (evt) => {
      if (checkModifiers(evt) && modifierSettings.enabled) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
      }
    },
    { capture: true },
  );
}

// Set up listeners immediately since we're running at document_start
setupEventListeners();

// Also set up listeners when DOM is ready as backup
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupEventListeners);
} else {
  // DOM is already ready
}
