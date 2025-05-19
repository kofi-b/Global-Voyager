import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';  
import '../css/CountryPage.css';  
import Navbar from '../components/Navbar';


function CountryPage() {
  const { countryName } = useParams();
  const [country, setCountry] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const countryResponse = await fetch(`http://localhost:5000/countries/${countryName}`);
        if (!countryResponse.ok) throw new Error('Country not found');
        const countryData = await countryResponse.json();
        setCountry(countryData);

        const mealsResponse = await fetch(`http://localhost:5000/meals/${countryName}`);
        if (!mealsResponse.ok) throw new Error('Meals not found');
        const mealsData = await mealsResponse.json();
        setMeals(mealsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [countryName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!country) return <div>Country not found</div>;

  // Prepare chart data for meal categories
  const categoryCounts = meals.reduce((acc, meal) => {
    acc[meal.category] = (acc[meal.category] || 0) + 1;
    return acc;
  }, {});
  const chartData = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      data: Object.values(categoryCounts),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#E75480', '#8A2BE2', '#D2691E', '#008080', '#4682B4'],  
    }]
  };

  return (
    <div>
        <Navbar />
        <div className="country-page">
        <header>
            <h1>{country.name}</h1>
            <img src={country.flag_url} alt={`${country.name} flag`} style={{ width: '100px' }} />
        </header>
        <section className="country-details">
            <h2>Details</h2>
            <p><strong>Capital:</strong> {country.capital}</p>
            <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
            <p><strong>Area:</strong> {country.area.toLocaleString()} km²</p>
            <p><strong>Languages:</strong> {country.languages.join(', ')}</p>
        </section>
        <section className="chart">
            <h2>Meal Categories</h2>
            {meals.length > 0 ? (
            <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
                <Pie data={chartData} />
            </div>
            ) : (
            <p>No meal data available for this country.</p>
            )}
        </section>
        <section className="meals">
            <h2>Meals</h2>
            <div className="meals-list">
            {meals.map((meal, index) => (
                <div key={index} className="meal-item">
                <img src={meal.meal_image} alt={meal.meal_name} style={{ width: '100px' }} />
                <h3>{meal.meal_name}</h3>
                <p><b>Recipe:</b> {meal.description.substring(0, 100)}...</p>
                </div>
            ))}
            </div>
        </section>
        </div>
    </div>
  );
}

export default CountryPage;