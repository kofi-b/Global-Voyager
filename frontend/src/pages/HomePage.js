import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import MapComponent from '../components/MapComponent';
import Navbar from '../components/Navbar';

function HomePage() {
  const [countries, setCountries] = useState([]);
  const [showGlobe, setShowGlobe] = useState(false); 

  // Fetch countries only when the globe is shown
  useEffect(() => {
    if (showGlobe) {
      fetch('http://localhost:5000/countries')
        .then(response => response.json())
        .then(data => setCountries(data))
        .catch(error => console.error('Error fetching countries:', error));
    }
  }, [showGlobe]);

  return (
    <div>
        <Navbar />
    
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Global Voyager</h1>
      {!showGlobe ? (
        <div>
          <p>Welcome to Global Voyager! Explore countries around the world with our interactive globe.</p>
          <button onClick={() => setShowGlobe(true)}>Begin</button>
        </div>
      ) : (
        <>
          <SearchBar countries={countries.map(c => c.name)} />
          <div style={{ marginTop: '20px' }}>
            <MapComponent countries={countries} />
          </div>
        </>
      )}
    </div>
    </div>
  );
}

export default HomePage;