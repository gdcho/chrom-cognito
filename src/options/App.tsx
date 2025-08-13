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
        <h2>Modifier Click Settings</h2>
        <p className="section-description">
          Configure modifier key combinations for clicking links to open them in
          incognito mode. For example, Cmd+Alt+Click on macOS or Ctrl+Alt+Click
          on Windows/Linux.
        </p>

        <div className="setting-group">
          <label className="main-checkbox-label">
            <input
              type="checkbox"
              checked={settings.modifierClick.enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  modifierClick: {
                    ...settings.modifierClick,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Enable modifier click to open in incognito
          </label>
          <p className="setting-description">
            When enabled, clicking links with the specified modifier keys will
            open them in incognito mode.
          </p>
        </div>

        {settings.modifierClick.enabled && (
          <div className="modifier-keys-group">
            <h3
              style={{
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text-primary)",
              }}
            >
              Required Modifier Keys
            </h3>
            <div className="modifier-checkboxes">
              <label className="modifier-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.modifierClick.requireCmd}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modifierClick: {
                        ...settings.modifierClick,
                        requireCmd: e.target.checked,
                      },
                    })
                  }
                />
                <span className="modifier-key-display">⌘ Cmd</span> (macOS)
              </label>

              <label className="modifier-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.modifierClick.requireCtrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modifierClick: {
                        ...settings.modifierClick,
                        requireCtrl: e.target.checked,
                      },
                    })
                  }
                />
                <span className="modifier-key-display">Ctrl</span>{" "}
                (Windows/Linux)
              </label>

              <label className="modifier-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.modifierClick.requireAlt}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modifierClick: {
                        ...settings.modifierClick,
                        requireAlt: e.target.checked,
                      },
                    })
                  }
                />
                <span className="modifier-key-display">Alt</span>
              </label>

              <label className="modifier-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.modifierClick.requireShift}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      modifierClick: {
                        ...settings.modifierClick,
                        requireShift: e.target.checked,
                      },
                    })
                  }
                />
                <span className="modifier-key-display">Shift</span>
              </label>
            </div>

            <div className="modifier-preview">
              <p>
                <strong>Current combination:</strong>{" "}
                <span className="combination-display">
                  {[
                    settings.modifierClick.requireCmd && "⌘ Cmd",
                    settings.modifierClick.requireCtrl && "Ctrl",
                    settings.modifierClick.requireAlt && "Alt",
                    settings.modifierClick.requireShift && "Shift",
                  ]
                    .filter(Boolean)
                    .join(" + ")}{" "}
                  + Click
                </span>
              </p>
              <p className="setting-description">
                💡 Tip: Choose different combinations for macOS (⌘ Cmd) and
                Windows/Linux (Ctrl) to work across platforms.
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2>Keyboard Shortcuts</h2>
        <p className="section-description">
          Configure keyboard shortcuts for quick access to incognito features.
          Note: Actual key combinations are managed by Chrome's extension
          settings.
        </p>

        <div className="shortcuts-list">
          <div className="shortcut-item">
            <div className="shortcut-info">
              <label className="shortcut-label">
                <input
                  type="checkbox"
                  checked={
                    settings.keyboardShortcuts.openCurrentInIncognito.enabled
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      keyboardShortcuts: {
                        ...settings.keyboardShortcuts,
                        openCurrentInIncognito: {
                          ...settings.keyboardShortcuts.openCurrentInIncognito,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                />
                Open current tab in Incognito
              </label>
              <span className="shortcut-key">
                {settings.keyboardShortcuts.openCurrentInIncognito.key}
              </span>
            </div>
            <p className="shortcut-description">
              {settings.keyboardShortcuts.openCurrentInIncognito.description}
            </p>
          </div>

          <div className="shortcut-item">
            <div className="shortcut-info">
              <label className="shortcut-label">
                <input
                  type="checkbox"
                  checked={
                    settings.keyboardShortcuts.openMatchingTabsInIncognito
                      .enabled
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      keyboardShortcuts: {
                        ...settings.keyboardShortcuts,
                        openMatchingTabsInIncognito: {
                          ...settings.keyboardShortcuts
                            .openMatchingTabsInIncognito,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                />
                Open matching tabs in Incognito
              </label>
              <span className="shortcut-key">
                {settings.keyboardShortcuts.openMatchingTabsInIncognito.key}
              </span>
            </div>
            <p className="shortcut-description">
              {
                settings.keyboardShortcuts.openMatchingTabsInIncognito
                  .description
              }
            </p>
          </div>

          <div className="shortcut-item">
            <div className="shortcut-info">
              <label className="shortcut-label">
                <input
                  type="checkbox"
                  checked={
                    settings.keyboardShortcuts.openAllTabsInIncognito.enabled
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      keyboardShortcuts: {
                        ...settings.keyboardShortcuts,
                        openAllTabsInIncognito: {
                          ...settings.keyboardShortcuts.openAllTabsInIncognito,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                />
                Open all tabs in Incognito
              </label>
              <span className="shortcut-key">
                {settings.keyboardShortcuts.openAllTabsInIncognito.key}
              </span>
            </div>
            <p className="shortcut-description">
              {settings.keyboardShortcuts.openAllTabsInIncognito.description}
            </p>
          </div>
        </div>

        <div className="shortcut-note">
          <p>
            💡 <strong>Tip:</strong> To change the actual key combinations, go
            to
            <code>chrome://extensions/shortcuts</code> in your browser and find
            ChromCognito.
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
