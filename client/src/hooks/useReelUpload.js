import { useRef, useState } from 'react';
import { api, uploadVideo } from '../services/api';

const MAX_DURATION_SEC = 240;

const readVideoDuration = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video duration.'));
    };
    video.src = url;
  });

export default function useReelUpload({ onUploaded, onError }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pickVideo = () => inputRef.current?.click();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    onError?.('');

    try {
      const duration = await readVideoDuration(file);
      if (duration > MAX_DURATION_SEC) {
        throw new Error('Reels must be 240 seconds or less.');
      }

      const uploaded = await uploadVideo(file);
      const data = await api('/reels', {
        method: 'POST',
        body: JSON.stringify({
          videoUrl: uploaded.url,
          durationSec: Math.round(duration),
          caption: ''
        })
      });

      onUploaded?.(data.reel);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  return { inputRef, uploading, pickVideo, handleFile };
}
