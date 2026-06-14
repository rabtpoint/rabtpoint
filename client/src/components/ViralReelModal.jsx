import ReelCard from './ReelCard';

export default function ViralReelModal({ reel, onClose, onProfile }) {
  if (!reel) return null;

  return (
    <div className="modal-backdrop viral-reel-backdrop" onClick={onClose}>
      <div className="viral-reel-modal" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close">
          x
        </button>
        <ReelCard reel={reel} onProfile={onProfile} />
      </div>
    </div>
  );
}
