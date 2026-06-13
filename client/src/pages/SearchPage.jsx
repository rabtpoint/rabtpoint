import { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import { IconGlobe, IconSend } from '../components/NavIcons';
import LocationDropdowns from '../components/LocationDropdowns';
import { fallbackUsers } from '../data/demo';
import { api } from '../services/api';

const emptyLocation = {
  countryCode: '',
  country: '',
  stateCode: '',
  state: '',
  district: '',
  city: ''
};

export default function SearchPage({ onProfile }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState(emptyLocation);
  const [users, setUsers] = useState(fallbackUsers);
  const [searched, setSearched] = useState(false);

  const search = async (event) => {
    event?.preventDefault();
    setSearched(true);
    const params = new URLSearchParams();
    if (name.trim()) params.set('name', name.trim());
    if (location.country) params.set('country', location.country);
    if (location.district) params.set('district', location.district);

    try {
      const data = await api(`/users?${params.toString()}`);
      setUsers(data.users.length ? data.users : []);
    } catch {
      setUsers(fallbackUsers);
    }
  };

  useEffect(() => {
    search();
  }, []);

  return (
    <section className="app-page search-page neon-search-page">
      <header className="search-hero">
        <div className="search-hero-icon hex-frame lg">
          <IconGlobe />
        </div>
        <h1>FIND PEOPLE ANYWHERE</h1>
        <p className="muted">Search by name, country, state, and district.</p>
      </header>

      <form className="neon-search-form" onSubmit={search}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <LocationDropdowns value={location} onChange={setLocation} />
        <button className="neon-gradient-btn wide" type="submit">
          SEARCH <IconSend />
        </button>
      </form>

      <div className="search-results">
        <h2 className="section-label">RESULTS</h2>
        {!users.length && searched ? (
          <p className="muted center-text">No users found. Try different filters.</p>
        ) : (
          <div className="search-result-list">
            {users.map((user) => (
              <button className="search-result-item" key={user.id || user._id} type="button" onClick={() => onProfile(user)}>
                <Avatar user={user} />
                <span>
                  <strong>{user.name}</strong>
                  <small>
                    {user.location?.district}, {user.location?.country}
                  </small>
                </span>
                <span className="chat-mini-btn">💬</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-globe-deco" aria-hidden="true">
        <IconGlobe />
      </div>
    </section>
  );
}
