import React, { useEffect, useState } from "react";
import type { Rule, Settings } from "../types";

const emptyRule: Rule = { pattern: "", useRegex: false };

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, setSettings);
  }, []);

  const save = () =>
    chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", payload: settings });

  if (!settings) return <div className="p-4 text-white">Loading…</div>;

  const updateRule = (i: number, patch: Partial<Rule>) => {
    const rules = [...settings.autoIncognitoRules];
    rules[i] = { ...rules[i], ...patch };
    setSettings({ ...settings, autoIncognitoRules: rules });
  };

  const addRule = () =>
    setSettings({
      ...settings,
      autoIncognitoRules: [...settings.autoIncognitoRules, { ...emptyRule }],
    });

  const removeRule = (i: number) =>
    setSettings({
      ...settings,
      autoIncognitoRules: settings.autoIncognitoRules.filter(
        (_, idx) => idx !== i,
      ),
    });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-white">
        ChromCognito Settings
      </h1>

      <section>
        <h2 className="font-medium mb-2 text-white">Auto-Incognito Rules</h2>
        {settings.autoIncognitoRules.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="border p-1 flex-1 bg-gray-700 text-white"
              value={r.pattern}
              placeholder="*.reddit.com"
              onChange={(e) => updateRule(i, { pattern: e.target.value })}
            />
            <label className="flex items-center gap-1 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={r.useRegex}
                onChange={(e) => updateRule(i, { useRegex: e.target.checked })}
              />
              regex
            </label>
            <button
              className="text-red-500 text-xs"
              onClick={() => removeRule(i)}
            >
              x
            </button>
          </div>
        ))}
        <button className="btn" onClick={addRule}>
          + Add rule
        </button>
      </section>

      <section>
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={settings.removeFromHistoryOnTransfer}
            onChange={(e) =>
              setSettings({
                ...settings,
                removeFromHistoryOnTransfer: e.target.checked,
              })
            }
          />
          Remove from normal history when transferring
        </label>
      </section>

      <section>
        <label className="block mb-1 text-white">
          Auto-close incognito tabs after (minutes, 0/blank to disable)
        </label>
        <input
          type="number"
          className="border p-1 w-24 bg-gray-700 text-white"
          value={settings.autoCloseMinutes ?? ""}
          onChange={(e) =>
            setSettings({
              ...settings,
              autoCloseMinutes: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
        <label className="block mt-2 mb-1 text-white">
          Excluded domains (comma separated)
        </label>
        <input
          className="border p-1 w-full bg-gray-700 text-white"
          value={settings.domainsExcludedFromAutoClose.join(",")}
          onChange={(e) =>
            setSettings({
              ...settings,
              domainsExcludedFromAutoClose: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </section>

      <button className="btn" onClick={save}>
        Save
      </button>
    </div>
  );
};

export default Options;
