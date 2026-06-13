import { useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import Avatar from '../components/Avatar';
import { IconFilter } from '../components/NavIcons';
import { fallbackUsers } from '../data/demo';
import { api } from '../services/api';

export default function MapPage({ onProfile }) {
  const [mode, setMode] = useState('osm');
  const [users, setUsers] = useState(fallbackUsers);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('Search location');

  useEffect(() => {
    api('/users')
      .then((data) => setUsers(data.users.length ? data.users : fallbackUsers))
      .catch(() => setUsers(fallbackUsers));
  }, []);

  const globePoints = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        lat: user.location.latitude,
        lng: user.location.longitude,
        size: 0.5,
        color: '#8E2DE2'
      })),
    [users]
  );

  const pickUser = (user) => {
    setSelected(user);
    onProfile?.(user);
  };

  return (
    <section className="app-page map-page neon-map-page">
      <div className="map-top neon-search-bar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location" />
        <button type="button" className="icon-btn" aria-label="Filter">
          <IconFilter />
        </button>
      </div>

      <div className="map-mode-tabs segmented neon-segmented">
        <button className={mode === 'osm' ? 'active' : ''} type="button" onClick={() => setMode('osm')}>
          Map
        </button>
        <button className={mode === 'globe' ? 'active' : ''} type="button" onClick={() => setMode('globe')}>
          Globe 3D
        </button>
      </div>

      <div className="map-card neon-map-card">
        {mode === 'osm' ? (
          <MapContainer center={[20, 78]} zoom={3} scrollWheelZoom className="osm-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {users.map((user) => (
              <CircleMarker
                center={[user.location.latitude, user.location.longitude]}
                key={user.id || user._id}
                pathOptions={{ color: '#8E2DE2', fillColor: '#4A00E0', fillOpacity: 0.85 }}
                radius={10}
                eventHandlers={{ click: () => pickUser(user) }}
              >
                <Popup>
                  <button className="popup-profile" type="button" onClick={() => pickUser(user)}>
                    <Avatar user={user} />
                    <span>{user.name}</span>
                  </button>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : (
          <Globe
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            pointsData={globePoints}
            pointAltitude="size"
            pointColor="color"
            pointLabel={(point) => `${point.name} - ${point.location.district}`}
            onPointClick={pickUser}
            height={520}
          />
        )}
      </div>

      {selected && (
        <div className="map-user-card neon-panel">
          <Avatar user={selected} size="lg" />
          <div>
            <strong>{selected.name}</strong>
            <small>
              {selected.location?.district}, {selected.location?.country}
            </small>
            <p className="online-dot">Active now</p>
          </div>
          <button className="neon-gradient-btn" type="button" onClick={() => onProfile(selected)}>
            View Profile
          </button>
        </div>
      )}
    </section>
  );
}
