import { useEffect, useMemo, useRef, useState } from 'react';
import ReelCard from '../components/ReelCard';
import TrendersRow from '../components/TrendersRow';
import ViralReelModal from '../components/ViralReelModal';
import { fallbackReels, fallbackTrenders } from '../data/demo';
import { fetchDiscover } from '../services/api';
import { countryDisplayLabel, normalizeCountry, storeTrendCountry } from '../utils/trendCountry';

export default function FeedPage({ onProfile, trend = 'Trend in Britain', userCountry = 'United Kingdom', refreshKey = 0 }) {
  const [reels, setReels] = useState(fallbackReels);
  const [trenders, setTrenders] = useState(fallbackTrenders);
  const [countryLabel, setCountryLabel] = useState('Britain');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viralReel, setViralReel] = useState(null);

  const country = useMemo(() => normalizeCountry(trend, userCountry), [trend, userCountry]);
  const prevCountryRef = useRef(country);

  useEffect(() => {
    const immediate = prevCountryRef.current === country && refreshKey > 0;
    prevCountryRef.current = country;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      storeTrendCountry(country);

      try {
        const data = await fetchDiscover(country);
        setReels(data.reels?.length ? data.reels : fallbackReels.filter((reel) => reel.country === country));
        setTrenders(data.trenders?.length ? data.trenders : fallbackTrenders);
        setCountryLabel(data.countryLabel || countryDisplayLabel(country));
      } catch (err) {
        setReels(fallbackReels.filter((reel) => reel.country === country || country === 'United Kingdom'));
        setTrenders(fallbackTrenders);
        setCountryLabel(countryDisplayLabel(country));
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, immediate ? 0 : 400);

    return () => clearTimeout(timer);
  }, [country, refreshKey]);

  return (
    <section className="app-page discover-page">
      <TrendersRow
        trenders={trenders}
        countryLabel={countryLabel}
        reels={reels}
        onProfile={onProfile}
        onOpenReel={setViralReel}
        onUploaded={(reel) => setReels((current) => [reel, ...current])}
        onError={setError}
      />

      {loading && <p className="muted center-text">Loading reels...</p>}
      {error && <p className="error-text center-text">{error}</p>}

      <div className="reels-feed">
        {reels.length === 0 ? (
          <p className="muted center-text">No reels yet for Trend in {countryLabel}. Upload the first one.</p>
        ) : (
          reels.map((reel) => <ReelCard key={reel._id} reel={reel} onProfile={onProfile} />)
        )}
      </div>

      <ViralReelModal reel={viralReel} onClose={() => setViralReel(null)} onProfile={onProfile} />
    </section>
  );
}
