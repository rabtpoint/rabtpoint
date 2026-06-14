import Avatar from './Avatar';
import { openTrender, trenderLocationLabel } from '../utils/trenderActions';

export default function TrendersAllModal({ open, trenders = [], countryLabel = 'Britain', reels = [], onClose, onOpenReel, onProfile }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="trenders-all-modal" onClick={(event) => event.stopPropagation()}>
        <header className="trenders-all-header">
          <h2>
            TRENDERS <span className="trenders-bolt" aria-hidden="true">⚡</span>
          </h2>
          <button type="button" className="trenders-view-all" onClick={onClose}>
            Close
          </button>
        </header>
        <p className="muted trender-all-sub">Trend in {countryLabel}</p>

        <ul className="trenders-all-list">
          {trenders.map((trender) => (
            <li key={trender.id || trender._id}>
              <button
                type="button"
                className="trenders-all-row"
                onClick={() => {
                  openTrender(trender, { reels, onOpenReel, onProfile });
                  onClose();
                }}
              >
                <Avatar user={trender} size="sm" />
                <span className="trenders-all-meta">
                  <strong>{trender.name}</strong>
                  <small>{trenderLocationLabel(trender)}</small>
                </span>
                <span className="trenders-all-stats">
                  <strong>{trender.totalViews || 0}</strong>
                  <small>views</small>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {!trenders.length && <p className="muted trender-empty">No trenders yet for this country.</p>}
      </article>
    </div>
  );
}
