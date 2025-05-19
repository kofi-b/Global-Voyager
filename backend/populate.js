const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateCountries() {
    try {
        // Clear the 'countries' table before inserting new data
        const { error: deleteError } = await supabase.from('countries').delete().neq('id', -1);
        if (deleteError) {
            console.error('Error clearing the "countries" table:', deleteError);
            return;
        }
        console.log('Cleared the "countries" table.');

        // Fetch all countries from the REST Countries API
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data;
        console.log(`Fetched ${countries.length} countries from API`);

        let insertedCount = 0;
        for (const country of countries) {
            try {
                const { name, capital, population, area, languages, flags, cca2, cca3, borders, gini, independent, region, subregion } = country;
                const countryData = {
                    name: name.common,
                    official_name: name.official,
                    capital: capital ? capital[0] : null,
                    population: population,
                    area: area,
                    languages: languages ? Object.values(languages) : [],
                    flag_url: flags.png,
                    cca2: cca2,
                    cca3: cca3,
                    borders: borders || [],
                    gini: gini ? Object.values(gini)[0] : null,
                    independent: independent,
                    region: region,
                    subregion: subregion
                };

                // Insert the country into the Supabase table
                const { error: insertError } = await supabase.from('countries').insert([countryData]);
                if (insertError) {
                    console.error(`Error inserting country ${name.common}:`, insertError);
                } else {
                    insertedCount++;
                }
            } catch (error) {
                console.error(`Error processing country:`, error);
            }
        }
        console.log(`Successfully inserted ${insertedCount} countries`);
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
}

populateCountries();

