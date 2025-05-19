const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const axios = require('axios');
const port = process.env.PORT || 5000;
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
require('dotenv').config();

app.use(express.json());
const allowedOrigins = [];
if (PROD_FRONTEND_URL) allowedOrigins.push(PROD_FRONTEND_URL);
if (PREVIEW_FRONTEND_URL) allowedOrigins.push(PREVIEW_FRONTEND_URL);

if (process.env.VERCEL_URL) {
    const currentDeploymentUrl = `https://${process.env.VERCEL_URL}`;
    if (!allowedOrigins.includes(currentDeploymentUrl)) { 
        allowedOrigins.push(currentDeploymentUrl);
    }
}
app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); 
      if (allowedOrigins.length === 0) { 
        console.warn('CORS: No allowedOrigins configured. Allowing all origins for now.');
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS Error: Origin ${origin} not allowed. Allowed: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cuisine mapping for TheMealDB API
const cuisineMapping = {
  'United States': 'American',
  'United Kingdom': 'British',
  'Canada': 'Canadian',
  'China': 'Chinese',
  'Croatia': 'Croatian',
  'Netherlands': 'Dutch',
  'Egypt': 'Egyptian',
  'Philippines': 'Filipino',
  'France': 'French',
  'Greece': 'Greek',
  'India': 'Indian',
  'Ireland': 'Irish',
  'Italy': 'Italian',
  'Jamaica': 'Jamaican',
  'Japan': 'Japanese',
  'Kenya': 'Kenyan',
  'Malaysia': 'Malaysian',
  'Mexico': 'Mexican',
  'Morocco': 'Moroccan',
  'Poland': 'Polish',
  'Portugal': 'Portuguese',
  'Russia': 'Russian',
  'Spain': 'Spanish',
  'Thailand': 'Thai',
  'Tunisia': 'Tunisian',
  'Turkey': 'Turkish',
  'Ukraine': 'Ukrainian',
  'Uruguay': 'Uruguayan',
  'Vietnam': 'Vietnamese'
};

// Endpoint to fetch countries from Supabase
app.get('/countries', async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  // check if Vercel is picking up the env vars 
  console.log('Current SUPABASE_URL (exists):', !!supabaseUrl);
  console.log('Current SUPABASE_KEY (exists):', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: SUPABASE_URL or SUPABASE_KEY is not set in the environment.');
    return res.status(500).json({ error: 'Server configuration error: Database credentials missing.' });
  }

  if (!supabase) {
    console.error('CRITICAL: Supabase client is not initialized.');
    return res.status(500).json({ error: 'Server configuration error: Database client not initialized.' });
  }

  try {
    console.log('Attempting to query Supabase for countries...');
    const { data, error: dbError } = await supabase
      .from('countries')
      .select('name, cca3, flag_url');

    if (dbError) {
      console.error('Supabase DB Error in /countries:', JSON.stringify(dbError, null, 2)); // Log the full Supabase error
      return res.status(500).json({ 
        error: 'Failed to fetch countries from database.', 
        details: dbError.message 
      });
    }

    console.log(`Successfully fetched ${data ? data.length : 0} countries.`);
    res.json(data);
  } catch (err) {
    console.error('Unexpected error in /countries route:', err.message, err.stack); // Log the full unexpected error
    res.status(500).json({ 
      error: 'An unexpected server error occurred.', 
      details: err.message 
    });
  }
});

// Endpoint to populate meals for a country
app.get('/populate-meals/:country', async (req, res) => {
  const { country } = req.params;
  const cuisine = cuisineMapping[country];
  if (!cuisine) {
    return res.status(400).json({ error: 'Cuisine not found for this country' });
  }

  try {
    // Get the country ID from the countries table
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id')
      .eq('name', country)
      .single();

    if (countryError || !countryData) {
      return res.status(404).json({ error: 'Country not found' });
    }

    const countryId = countryData.id;

    // Fetch meals from TheMealDB API
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`);
    const meals = response.data.meals || [];

    // Insert meals into the meals table, avoiding duplicates
    for (const meal of meals) {
      const mealDetailsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const mealDetails = mealDetailsResponse.data.meals ? mealDetailsResponse.data.meals[0] : null;

      if (!mealDetails) {
        console.log(`Meal details not found for ${meal.strMeal}`);
        continue; 
      }

      // Check if the meal already exists for this country
      const { data: existingMeal, error: checkError } = await supabase
        .from('meals')
        .select('id')
        .eq('country_id', countryId)
        .eq('meal_name', meal.strMeal)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error(`Error checking meal ${meal.strMeal}:`, checkError);
        continue;
      }

      if (existingMeal) {
        console.log(`Meal ${meal.strMeal} already exists for ${country}`);
        continue; 
      }

      // Prepare meal data for insertion
      const mealData = {
        country_id: countryId,
        meal_name: meal.strMeal,
        meal_image: meal.strMealThumb,
        description: mealDetails.strInstructions,
        recipe_link: mealDetails.strYoutube,
        category: mealDetails.strCategory
      };

      // Insert the meal
      const { error: insertError } = await supabase.from('meals').insert([mealData]);
      if (insertError) {
        console.error(`Error inserting meal ${meal.strMeal}:`, insertError);
      } else {
        console.log(`Successfully inserted meal ${meal.strMeal} for ${country}`);
      }
    }

    res.json({ message: `Meals for ${country} populated successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to populate meals' });
  }
});

// Existing endpoint to fetch meals
app.get('/meals/:country', async (req, res) => {
  const { country } = req.params;
  try {
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id')
      .eq('name', country)
      .single();

    if (countryError || !countryData) {
      return res.status(404).json({ error: 'Country not found' });
    }

    const countryId = countryData.id;

    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('meal_name, meal_image, description, recipe_link, category')
      .eq('country_id', countryId);

    if (mealsError) {
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }

    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to fetch a specific country by name
app.get('/countries/:country', async (req, res) => {
  const { country } = req.params;
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')  
      .eq('name', country)
      .single();  
    if (error || !data) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/populate-all-meals', async (req, res) => {
  const countriesToPopulate = Object.keys(cuisineMapping).filter(country => country !== 'Canada');

  for (const country of countriesToPopulate) {
    const cuisine = cuisineMapping[country];
    try {
      // Fetch the country ID from Supabase
      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('name', country)
        .single();

      if (countryError || !countryData) {
        console.error(`Country not found: ${country}`);
        continue;
      }

      const countryId = countryData.id;

      // Fetch meals from TheMealDB API for the given cuisine
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`);
      const meals = response.data.meals || [];

      for (const meal of meals) {
        // Fetch detailed meal information
        const mealDetailsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const mealDetails = mealDetailsResponse.data.meals ? mealDetailsResponse.data.meals[0] : null;

        if (!mealDetails) {
          console.log(`Meal details not found for ${meal.strMeal}`);
          continue;
        }

        // Check for duplicate meals in Supabase
        const { data: existingMeal, error: checkError } = await supabase
          .from('meals')
          .select('id')
          .eq('country_id', countryId)
          .eq('meal_name', meal.strMeal)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { 
          console.error(`Error checking meal ${meal.strMeal}:`, checkError);
          continue;
        }

        if (existingMeal) {
          console.log(`Meal ${meal.strMeal} already exists for ${country}`);
          continue;
        }

        // Prepare meal data for insertion
        const mealData = {
          country_id: countryId,
          meal_name: meal.strMeal,
          meal_image: meal.strMealThumb,
          description: mealDetails.strInstructions,
          recipe_link: mealDetails.strYoutube,
          category: mealDetails.strCategory
        };

        // Insert the meal into Supabase
        const { error: insertError } = await supabase.from('meals').insert([mealData]);
        if (insertError) {
          console.error(`Error inserting meal ${meal.strMeal}:`, insertError);
        } else {
          console.log(`Successfully inserted meal ${meal.strMeal} for ${country}`);
        }
      }
    } catch (error) {
      console.error(`Error populating meals for ${country}:`, error.message);
    }
  }

  res.json({ message: 'Meals populated for all countries' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});