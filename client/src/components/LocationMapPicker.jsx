import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapRecenter({ lat, lng, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);

  return null;
}

function MapClickLayer({ onPick }) {
  const map = useMap();

  useEffect(() => {
    const handler = (event) => {
      onPick(event.latlng.lat, event.latlng.lng);
    };

    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onPick]);

  return null;
}

export default function LocationMapPicker({ latitude, longitude, onChange }) {
  const hasPin = Boolean(latitude && longitude);
  const lat = hasPin ? parseFloat(latitude) : 20;
  const lng = hasPin ? parseFloat(longitude) : 0;
  const zoom = hasPin ? 12 : 2;

  const pick = (nextLat, nextLng) => {
    onChange({
      latitude: nextLat.toFixed(6),
      longitude: nextLng.toFixed(6)
    });
  };

  return (
    <div className="signup-map-picker">
      <label className="location-field">
        <span>Pick location on map</span>
        <p className="muted map-hint">Tap anywhere on the map to place your pin.</p>
      </label>
      <div className="signup-map-wrap">
        <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom className="signup-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapRecenter lat={lat} lng={lng} zoom={zoom} />
          <MapClickLayer onPick={pick} />
          {hasPin && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
      {hasPin && (
        <p className="info-text map-coords">
          Pin set: {latitude}, {longitude}
        </p>
      )}
    </div>
  );
}
