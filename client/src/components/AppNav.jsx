import { IconChat, IconDiscover, IconFriends, IconMap, IconSearch } from './NavIcons';

export const NAV_ITEMS = [
  { id: 'discover', label: 'Discover', Icon: IconDiscover },
  { id: 'friends', label: 'Friends', Icon: IconFriends },
  { id: 'chat', label: 'Chat', Icon: IconChat },
  { id: 'map', label: 'Map', Icon: IconMap },
  { id: 'search', label: 'Search', Icon: IconSearch }
];

export function DesktopNav({ activePage, onSelect }) {
  return (
    <nav className="desktop-nav" aria-label="Main">
      {NAV_ITEMS.map((item, index) => (
        <button
          key={item.id}
          className={`desktop-nav-item ${activePage === index ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(index)}
        >
          <item.Icon active={activePage === index} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function MobileNav({ activePage, onSelect }) {
  return (
    <nav className="mobile-nav neon-nav" aria-label="Main">
      {NAV_ITEMS.map((item, index) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activePage === index ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(index)}
        >
          <span className="mobile-nav-icon">
            <item.Icon active={activePage === index} />
          </span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
