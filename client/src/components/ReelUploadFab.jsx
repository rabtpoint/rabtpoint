import { IconPlus } from './NavIcons';
import useReelUpload from '../hooks/useReelUpload';

export default function ReelUploadFab({ onUploaded, onError }) {
  const { inputRef, uploading, pickVideo, handleFile } = useReelUpload({ onUploaded, onError });

  return (
    <>
      <button
        className="reel-upload-fab"
        type="button"
        onClick={pickVideo}
        disabled={uploading}
        aria-label="Upload reel"
      >
        {uploading ? '...' : <IconPlus />}
      </button>
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={handleFile} />
    </>
  );
}
