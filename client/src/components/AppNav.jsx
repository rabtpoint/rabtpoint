import { IconChat, IconDiscover, IconFriends, IconMap, IconSearch } from './NavIcons';

export const NAV_ITEMS = [
  { id: 'discover', label: 'Discover', Icon: IconDiscover, glow: 'purple' },
  { id: 'friends', label: 'Friends', Icon: IconFriends, glow: 'blue' },
  { id: 'chat', label: 'Chat', Icon: IconChat, center: true, glow: 'blue' },
  { id: 'map', label: 'Map', Icon: IconMap, glow: 'blue' },
  { id: 'search', label: 'Search', Icon: IconSearch, glow: 'purple' }
];

const sideItems = NAV_ITEMS.filter((item) => !item.center);
const centerItem = NAV_ITEMS.find((item) => item.center);
const centerIndex = NAV_ITEMS.findIndex((item) => item.center);

export function BottomNav({ activePage, onSelect }) {
  const left = sideItems.slice(0, 2);
  const right = sideItems.slice(2);

  return (
    <div className="neon-nav-dock">
      <nav className="neon-nav-segmented" aria-label="Main">
        <div className="neon-nav-panel neon-nav-panel-left">
          {left.map((item) => {
            const index = NAV_ITEMS.indexOf(item);
            const active = activePage === index;
            return (
              <button
                key={item.id}
                className={`neon-seg-btn glow-${item.glow} ${active ? 'active' : ''}`}
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mobile-nav-icon">
                  <item.Icon active={active} />
                </span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          className={`neon-nav-hub ${activePage === centerIndex ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(centerIndex)}
          aria-label={centerItem.label}
          aria-current={activePage === centerIndex ? 'page' : undefined}
        >
          <span className="neon-nav-hub-ring">
            <span className="neon-nav-hub-core">
              <centerItem.Icon active={activePage === centerIndex} />
            </span>
          </span>
          <span className="mobile-nav-label">{centerItem.label}</span>
        </button>

        <div className="neon-nav-panel neon-nav-panel-right">
          {right.map((item) => {
            const index = NAV_ITEMS.indexOf(item);
            const active = activePage === index;
            return (
              <button
                key={item.id}
                className={`neon-seg-btn glow-${item.glow} ${active ? 'active' : ''}`}
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mobile-nav-icon">
                  <item.Icon active={active} />
                </span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
