import AppSettingsMenu from './AppSettingsMenu';
import { IconFilter } from './NavIcons';

export default function AppHeader({ trend, onTrendChange, onTrendApply, onViewProfile, onOpenSettings }) {
  return (
    <header className="app-header-bar">
      <span className="brand-glow app-logo">RabtPoint</span>

      <div className="header-right">
        <div className="header-trend-search neon-search-bar compact">
          <input
            value={trend}
            onChange={(event) => onTrendChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onTrendApply?.();
            }}
            placeholder="Trend in Britain"
            aria-label="Trend search"
          />
          <button type="button" className="icon-btn" aria-label="Filter trends" onClick={() => onTrendApply?.()}>
            <IconFilter />
          </button>
        </div>
        <AppSettingsMenu onViewProfile={onViewProfile} onOpenSettings={onOpenSettings} />
      </div>
    </header>
  );
}
