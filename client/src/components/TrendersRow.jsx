import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import TrendersAllModal from './TrendersAllModal';
import useReelUpload from '../hooks/useReelUpload';
import { IconPlus } from './NavIcons';
import { openTrender, trenderLocationLabel } from '../utils/trenderActions';

const hexVariants = ['hex-purple', 'hex-blue', 'hex-magenta', 'hex-cyan', 'hex-violet'];

function TrenderCard({ trender, variant = 0, onClick }) {
  return (
    <button className="trender-card" type="button" onClick={onClick}>
      <div className={`hex-frame ${hexVariants[variant % hexVariants.length]}`}>
        <Avatar user={trender} />
      </div>
      <strong>{trender.name?.split(' ')[0]}</strong>
      <small>{trenderLocationLabel(trender)}</small>
    </button>
  );
}

export default function TrendersRow({
  trenders = [],
  countryLabel = 'Britain',
  reels = [],
  onProfile,
  onOpenReel,
  onUploaded,
  onError
}) {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const { inputRef, uploading, pickVideo, handleFile } = useReelUpload({ onUploaded, onError });

  const marqueeTrenders = useMemo(() => {
    if (trenders.length <= 1) return trenders;
    return [...trenders, ...trenders];
  }, [trenders]);

  const handleTrender = (trender) => {
    openTrender(trender, { reels, onOpenReel, onProfile });
  };

  return (
    <>
      <div className="trenders-sticky">
        <header className="trenders-header">
          <h2 className="trenders-title">
            TRENDERS <span className="trenders-bolt" aria-hidden="true">⚡</span>
          </h2>
          <button type="button" className="trenders-view-all" onClick={() => setViewAllOpen(true)}>
            VIEW ALL
          </button>
        </header>

        <div className="trenders-row-wrap">
          <button
            className="trender-card trender-upload"
            type="button"
            onClick={pickVideo}
            disabled={uploading}
            aria-label="Add video reel"
          >
            <div className="hex-frame hex-add">
              <span className="hex-add-icon">{uploading ? '…' : <IconPlus />}</span>
            </div>
            <strong>{uploading ? 'Uploading' : 'Add Reel'}</strong>
            <small>Video</small>
          </button>
          <input ref={inputRef} type="file" accept="video/*" hidden onChange={handleFile} />

          <div className={`trenders-marquee ${trenders.length ? '' : 'is-empty'}`}>
            {trenders.length ? (
              <div className="trenders-track" style={{ '--trender-count': trenders.length }}>
                {marqueeTrenders.map((trender, index) => (
                  <TrenderCard
                    key={`${trender.id || trender._id}-${index}`}
                    trender={trender}
                    variant={index}
                    onClick={() => handleTrender(trender)}
                  />
                ))}
              </div>
            ) : (
              <p className="muted trender-empty">No trenders yet for Trend in {countryLabel}.</p>
            )}
          </div>
        </div>
      </div>

      <TrendersAllModal
        open={viewAllOpen}
        trenders={trenders}
        countryLabel={countryLabel}
        reels={reels}
        onClose={() => setViewAllOpen(false)}
        onOpenReel={onOpenReel}
        onProfile={onProfile}
      />
    </>
  );
}
