import React from 'react';
import '../css/AboutPage.css'; 
import Navbar from '../components/Navbar';


function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="about-page">
        <header className="about-header">
          <h1>About Global Voyager</h1>
        </header>
        <section className="about-section">
          <h2>Project Description</h2>
          <p>
            Global Voyager is an interactive web application that allows users to explore countries around the world. It provides geographical, demographic, and cultural information in an engaging and visually appealing way, helping users learn about different nations through interactive maps, data visualizations, and cultural insights.
          </p>
        </section>
        <section className="about-section">
          <h2>Technologies Used</h2>
          <ul>
            <li><strong>Frontend</strong>: React, React-Globe.gl, Chart.js</li>
            <li><strong>Backend</strong>: Node.js, Express.js</li>
            <li><strong>Database</strong>: Supabase</li>
            <li><strong>APIs</strong>: REST Countries API, TheMealDB API</li>
          </ul>
        </section>
        <section className="about-section">
          <h2>Credits and Acknowledgments</h2>
          <p>
            Country data is sourced from the <a href="https://restcountries.com/" target="_blank" rel="noopener noreferrer">REST Countries API</a>. Cultural insights and meal data are provided by <a href="https://www.themealdb.com/" target="_blank" rel="noopener noreferrer">TheMealDB API</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;