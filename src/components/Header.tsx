import React from "react";
import { RefreshCw, Settings } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  onSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, onSettings }) => {
  return (
    <header className="chronow-header">
      <div className="flex items-center gap-sm">
        <img
          src="/icons/chromcognito.png"
          alt="ChromCognito"
          className="header-logo"
          width={34}
          height={34}
        />
        <h1 className="text-lg font-semibold text-primary">ChromCognito</h1>
      </div>

      <div className="flex items-center gap-sm">
        <button
          onClick={onRefresh}
          className="p-sm hover-bg rounded-md transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className="icon" size={20} />
        </button>
        <button
          onClick={onSettings}
          className="p-sm hover-bg rounded-md transition-colors"
          aria-label="Settings"
        >
          <Settings className="icon" size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
