import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import countries from 'world-countries';

function MapComponent() {
  const navigate = useNavigate();
  const [globeData, setGlobeData] = useState([]);
  const [hoveredCountryName, setHoveredCountryName] = useState(null);
  const url = `https://${process.env.REACT_APP_API_URL}/countries`;

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const mergedData = data
          .map(backendCountry => {
            const worldCountry = countries.find(
              wc => wc.name.common.toLowerCase() === backendCountry.name.toLowerCase() ||
                    wc.cca3 === backendCountry.cca3
            );
            return worldCountry
              ? {
                  ...backendCountry,
                  lat: worldCountry.latlng[0],
                  lng: worldCountry.latlng[1]
                }
              : null;
          })
          .filter(Boolean);
        setGlobeData(mergedData);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, [url]);

  const handleCountryClick = (country) => {
    navigate(`/country/${country.name}`);
  };

  const handlePointHover = (point) => {
    setHoveredCountryName(point ? point.name : null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#000000"
        pointsData={globeData}
        pointLat="lat"
        pointLng="lng"
        pointRadius={0.3}
        pointColor={() => '#ff0000'}
        pointAltitude={0.05}
        onPointClick={handleCountryClick}
        onPointHover={handlePointHover}
      />
      {hoveredCountryName && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            fontSize: '34px',
            zIndex: 1000,
            pointerEvents: 'none' // Prevents the tooltip from blocking mouse events
          }}
        >
          {hoveredCountryName}
        </div>
      )}
    </div>
  );
}

export default MapComponent;