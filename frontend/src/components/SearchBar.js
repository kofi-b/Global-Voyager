import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar({ countries }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filtered = countries.filter(country =>
        country.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (country) => {
    navigate(`/country/${country}`);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a country"
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;