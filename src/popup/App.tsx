import React, { useEffect, useState, useRef } from "react";
import type { Settings, RecentlyClosedTab, TransferMode } from "../types";
import Header from "../components/Header";

// Loading and Error State Types
interface LoadingState {
  settings: boolean;
  recentTabs: boolean;
  transfer: boolean;
}

interface ErrorState {
  settings: string | null;
  recentTabs: string | null;
  transfer: string | null;
}

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [recent, setRecent] = useState<RecentlyClosedTab[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    settings: true,
    recentTabs: true,
    transfer: false,
  });
  const [errorState, setErrorState] = useState<ErrorState>({
    settings: null,
    recentTabs: null,
    transfer: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingState({ settings: true, recentTabs: true, transfer: false });
    setErrorState({ settings: null, recentTabs: null, transfer: null });

    // Load settings
    try {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        if (chrome.runtime.lastError) {
          setErrorState((prev) => ({
            ...prev,
            settings: "Failed to load settings",
          }));
        } else if (response) {
          setSettings(response);
        } else {
          setErrorState((prev) => ({
            ...prev,
            settings: "No settings data available",
          }));
        }
        setLoadingState((prev) => ({ ...prev, settings: false }));
      });
    } catch {
      setErrorState((prev) => ({
        ...prev,
        settings: "Failed to connect to extension",
      }));
      setLoadingState((prev) => ({ ...prev, settings: false }));
    }

    // Load recently closed tabs
    try {
      chrome.runtime.sendMessage(
        { type: "GET_RECENTLY_CLOSED" },
        (response) => {
          if (chrome.runtime.lastError) {
            setErrorState((prev) => ({
              ...prev,
              recentTabs: "Failed to load recently closed tabs",
            }));
          } else if (Array.isArray(response)) {
            setRecent(response);
          } else {
            setRecent([]);
          }
          setLoadingState((prev) => ({ ...prev, recentTabs: false }));
        },
      );
    } catch {
      setErrorState((prev) => ({
        ...prev,
        recentTabs: "Failed to connect to extension",
      }));
      setLoadingState((prev) => ({ ...prev, recentTabs: false }));
    }
  };

  // Handle scroll detection for fade effects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      container.classList.toggle("has-scroll", hasScroll);
    };

    // Initial check
    updateScrollState();

    // Check on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [recent]);

  const transfer = async (mode: TransferMode, rulesOnly = false) => {
    setLoadingState((prev) => ({ ...prev, transfer: true }));
    setErrorState((prev) => ({ ...prev, transfer: null }));

    try {
      chrome.runtime.sendMessage({ type: "TRANSFER", mode, rulesOnly }, () => {
        if (chrome.runtime.lastError) {
          setErrorState((prev) => ({
            ...prev,
            transfer: "Failed to transfer tabs",
          }));
        }
        setLoadingState((prev) => ({ ...prev, transfer: false }));
      });
    } catch {
      setErrorState((prev) => ({
        ...prev,
        transfer: "Failed to connect to extension",
      }));
      setLoadingState((prev) => ({ ...prev, transfer: false }));
    }
  };

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

  const handleRefresh = () => {
    loadData();
  };

  const handleSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  // Loading Spinner Component
  const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
    size = "md",
  }) => (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
    </div>
  );

  // Error Message Component
  const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
    message,
    onRetry,
  }) => (
    <div className="error-state">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button className="btn btn-sm btn-secondary" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState: React.FC<{
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  }> = ({ title, description, action }) => (
    <div className="empty-state">
      <div className="empty-state-content">
        <h4 className="empty-state-title">{title}</h4>
        {description && (
          <p className="empty-state-description">{description}</p>
        )}
        {action && (
          <button className="btn btn-sm btn-secondary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );

  // Show loading state while settings are loading
  if (loadingState.settings && !settings) {
    return (
      <div className="chronow-popup">
        <Header onRefresh={handleRefresh} onSettings={handleSettings} />
        <div className="chronow-content">
          <div className="loading-container">
            <LoadingSpinner size="lg" />
            <p className="loading-text">Loading extension settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if settings failed to load
  if (errorState.settings && !settings) {
    return (
      <div className="chronow-popup">
        <Header onRefresh={handleRefresh} onSettings={handleSettings} />
        <div className="chronow-content">
          <ErrorMessage message={errorState.settings} onRetry={handleRefresh} />
        </div>
      </div>
    );
  }

  // Show empty state if no settings available
  if (!settings && !loadingState.settings) {
    return (
      <div className="chronow-popup">
        <Header onRefresh={handleRefresh} onSettings={handleSettings} />
        <div className="chronow-content">
          <EmptyState
            title="No Settings Available"
            description="Extension settings could not be loaded. Please check your extension configuration."
            action={{ label: "Open Settings", onClick: handleSettings }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="chronow-popup">
      <Header onRefresh={handleRefresh} onSettings={handleSettings} />
      <div className="chronow-content">
        {/* Main Action Buttons Section */}
        <div className="action-section">
          {errorState.transfer && (
            <ErrorMessage
              message={errorState.transfer}
              onRetry={() =>
                setErrorState((prev) => ({ ...prev, transfer: null }))
              }
            />
          )}
          <div className="button-group">
            <button
              className={`btn btn-primary ${
                loadingState.transfer ? "loading" : ""
              }`}
              disabled={loadingState.transfer}
              onClick={(e) => {
                transfer("current");
                handleRipple(e);
              }}
            >
              <span className="btn-text">Open current tab in Incognito</span>
            </button>
            <button
              className={`btn btn-secondary ${
                loadingState.transfer ? "loading" : ""
              }`}
              disabled={loadingState.transfer}
              onClick={(e) => {
                transfer("allMatching", true);
                handleRipple(e);
              }}
            >
              <span className="btn-text">Open rule-matching tabs</span>
            </button>
            <button
              className={`btn btn-secondary ${
                loadingState.transfer ? "loading" : ""
              }`}
              disabled={loadingState.transfer}
              onClick={(e) => {
                transfer("allWindow");
                handleRipple(e);
              }}
            >
              <span className="btn-text">Open all tabs in window</span>
            </button>
          </div>
        </div>

        {/* Recently Closed Section */}
        <div className="recently-closed-section">
          <div className="section-header">
            <h3 className="section-title">Recently Closed (Incognito)</h3>
            {!loadingState.recentTabs && recent.length > 0 && (
              <span className="section-count">
                {recent.length} {recent.length === 1 ? "tab" : "tabs"}
              </span>
            )}
            {loadingState.recentTabs && <LoadingSpinner size="sm" />}
          </div>

          {loadingState.recentTabs ? (
            <div className="recently-closed-container">
              <div className="loading-container">
                <div className="skeleton-list">
                  <div className="skeleton skeleton-text long"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text long"></div>
                </div>
              </div>
            </div>
          ) : errorState.recentTabs ? (
            <ErrorMessage
              message={errorState.recentTabs}
              onRetry={() => {
                setErrorState((prev) => ({ ...prev, recentTabs: null }));
                setLoadingState((prev) => ({ ...prev, recentTabs: true }));
                chrome.runtime.sendMessage(
                  { type: "GET_RECENTLY_CLOSED" },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      setErrorState((prev) => ({
                        ...prev,
                        recentTabs: "Failed to load recently closed tabs",
                      }));
                    } else if (Array.isArray(response)) {
                      setRecent(response);
                    } else {
                      setRecent([]);
                    }
                    setLoadingState((prev) => ({ ...prev, recentTabs: false }));
                  },
                );
              }}
            />
          ) : recent.length > 0 ? (
            <div className="recently-closed-container" ref={containerRef}>
              <ul className="recently-closed-list" role="list">
                {recent.map((r, i) => (
                  <li key={i} className="recently-closed-item" role="listitem">
                    <a
                      className="recently-closed-link"
                      onClick={(e) => {
                        e.preventDefault();
                        chrome.tabs.create({ url: r.url });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          chrome.tabs.create({ url: r.url });
                        }
                      }}
                      href={r.url}
                      title={`Open: ${r.title || r.url}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open tab: ${r.title || r.url}`}
                    >
                      <span className="link-title">{r.title || r.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              title="No Recently Closed Tabs"
              description="No incognito tabs have been closed recently."
            />
          )}
        </div>
      </div>

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

export default Popup;
