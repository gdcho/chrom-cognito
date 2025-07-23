import React, { useEffect, useState } from "react";
import type { Settings, RecentlyClosedTab, TransferMode } from "../types";

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [recent, setRecent] = useState<RecentlyClosedTab[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, setSettings);
    chrome.runtime.sendMessage({ type: "GET_RECENTLY_CLOSED" }, setRecent);
  }, []);

  const transfer = (mode: TransferMode, rulesOnly = false) =>
    chrome.runtime.sendMessage({ type: "TRANSFER", mode, rulesOnly });

  if (!settings) return <div className="p-3">Loading…</div>;

  return (
    <div className="p-4 w-80 text-sm space-y-3">
      <button className="btn" onClick={() => transfer("current")}>
        Open current tab in Incognito
      </button>
      <button className="btn" onClick={() => transfer("allMatching", true)}>
        Open rule-matching tabs
      </button>
      <button className="btn" onClick={() => transfer("allWindow")}>
        Open all tabs in window
      </button>

      <div>
        <h3 className="font-medium mt-4 mb-1">Recently Closed (Incognito)</h3>
        <ul className="space-y-1 max-h-32 overflow-auto">
          {recent.map((r, i) => (
            <li key={i}>
              <a
                className="underline"
                onClick={() => chrome.tabs.create({ url: r.url })}
              >
                {r.title || r.url}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <a
        className="underline text-xs block text-right"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        Settings
      </a>
    </div>
  );
};

export default Popup;
