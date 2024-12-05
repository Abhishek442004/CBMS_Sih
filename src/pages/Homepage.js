import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correct marker icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function Homepage() {
  const navigate = useNavigate();
  
  // More precise coordinates for Atal Tunnel
  const TunnelCoords = [32.4026, 77.2063]; // Updated central coordinates

  // Refined marker positions with more precise coordinates
  const markers = [
    { id: 1, position: [32.3897, 77.1970], label: 'South Portal - Booster Fan 1' },
    { id: 2, position: [32.3980, 77.2020], label: 'Midpoint - Booster Fan 2' },
    { id: 3, position: [32.4050, 77.2100], label: 'Midpoint - Booster Fan 1' },
    { id: 4, position: [32.4026, 77.2063], label: 'Middle Tunnel - Booster Fan 2' },
    { id: 5, position: [32.4178, 77.2273], label: 'North Portal - Booster Fan 1' },
    { id: 6, position: [32.4200, 77.2300], label: 'North Portal - Booster Fan 2' },
  ];
 
  return (
    <MapContainer 
      style={{ height: 'calc(100vh - 50px)', width: '100%' }} 
      center={TunnelCoords} 
      zoom={13} // Slightly reduced zoom for better context
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          eventHandlers={{
            click: () => navigate(`/mqtt/${marker.id}`),
          }}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Homepage;