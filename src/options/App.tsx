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

  if (!settings)
    return (
      <div className="options-container">
        <div className="loading-container">
          <div className="loading-spinner lg">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Loading settings...</p>
        </div>
      </div>
    );

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
    <div className="options-container">
      <div className="options-header">
        <img
          src="/icons/chromcognito.png"
          alt="ChromCognito"
          className="options-logo"
          width={34}
          height={34}
        />
        <h1>ChromCognito Settings</h1>
      </div>

      <section>
        <h2>Auto-Incognito Rules</h2>
        <p className="section-description">
          Add URL patterns that should automatically open in incognito mode. Use
          wildcards (*) or enable regex for advanced patterns.
        </p>
        <div className="rules-list">
          {settings.autoIncognitoRules.map((r, i) => (
            <div key={i} className="rule-row">
              <input
                type="text"
                value={r.pattern}
                placeholder="*.reddit.com or https://example.com/*"
                onChange={(e) => updateRule(i, { pattern: e.target.value })}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={r.useRegex}
                  onChange={(e) =>
                    updateRule(i, { useRegex: e.target.checked })
                  }
                />
                Regex
              </label>
              <button
                className="remove-button"
                onClick={() => removeRule(i)}
                title="Remove rule"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary add-rule-button" onClick={addRule}>
          + Add Rule
        </button>
      </section>

      <section>
        <h2>History Management</h2>
        <div className="setting-group">
          <label className="main-checkbox-label">
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
            Remove from normal history when transferring to incognito
          </label>
          <p className="setting-description">
            When enabled, tabs transferred to incognito will be removed from
            your regular browsing history.
          </p>
        </div>
      </section>

      <section>
        <h2>Auto-Close Settings</h2>
        <div className="setting-group">
          <label className="input-label">
            Auto-close incognito tabs after (minutes, 0 or blank to disable)
          </label>
          <input
            type="number"
            className="number-input"
            value={settings.autoCloseMinutes ?? ""}
            placeholder="0"
            min="0"
            onChange={(e) =>
              setSettings({
                ...settings,
                autoCloseMinutes: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          />
        </div>

        <div className="setting-group">
          <label className="input-label">
            Excluded domains (comma separated)
          </label>
          <input
            type="text"
            className="text-input-full"
            value={settings.domainsExcludedFromAutoClose.join(",")}
            placeholder="example.com, important-site.org"
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
          <p className="setting-description">
            Tabs from these domains will not be automatically closed, even if
            auto-close is enabled.
          </p>
        </div>
      </section>

      <button className="btn btn-primary save-button" onClick={save}>
        Save Settings
      </button>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <span className="footer-text">
              Made with <span className="heart">❤️</span> by{" "}
              <a
                href="https://github.com/rj-labs-co"
                target="_blank"
                rel="noreferrer"
                className="link-secondary"
              >
                rj labs
              </a>
            </span>
            <span className="footer-divider"> | </span>
            <a
              href="https://www.buymeacoffee.com/yourname"
              target="_blank"
              rel="noreferrer"
              className="link-secondary"
              title="Support my work"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Options;
