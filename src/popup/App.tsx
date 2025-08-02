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

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const x = e.clientX - rect.left - ripple.offsetWidth / 2;
    const y = e.clientY - rect.top - ripple.offsetHeight / 2;

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    button.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  };

  if (!settings) return <div className="p-3 text-white">Loading…</div>;

  return (
    <div className="relative h-screen w-screen">
      <div className="p-4 w-80 text-sm space-y-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <button
          className="btn"
          onClick={(e) => {
            transfer("current");
            handleRipple(e);
          }}
        >
          Open current tab in Incognito
        </button>
        <button
          className="btn"
          onClick={(e) => {
            transfer("allMatching", true);
            handleRipple(e);
          }}
        >
          Open rule-matching tabs
        </button>
        <button
          className="btn"
          onClick={(e) => {
            transfer("allWindow");
            handleRipple(e);
          }}
        >
          Open all tabs in window
        </button>

        <div>
          <h3 className="font-medium mt-4 mb-1 text-white">
            Recently Closed (Incognito)
          </h3>
          <ul className="space-y-1 max-h-32 overflow-auto">
            {recent.map((r, i) => (
              <li key={i}>
                <a
                  className="underline text-green-400"
                  onClick={() => chrome.tabs.create({ url: r.url })}
                >
                  {r.title || r.url}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a
          className="underline text-xs block text-right text-green-400"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </a>
      </div>
    </div>
  );
};

export default Popup;
