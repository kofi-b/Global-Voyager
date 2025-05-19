# Developer Manual for Global Voyager

This manual provides detailed instructions for setting up, running, and maintaining the Global Voyager web application. It is intended for developers who will be working on the project, whether for initial setup or ongoing development.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Running the Application](#running-the-application)
5. [API Endpoints](#api-endpoints)
6. [Database Population](#database-population)
7. [Troubleshooting](#troubleshooting)
8. [Known Bugs](#known-bugs)
9. [Roadmap](#roadmap)

---

## Prerequisites

Before you begin, ensure you have the following tools installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Supabase Account**: Required for database access (sign up at [supabase.io](https://supabase.io))

Additionally, you should have a basic understanding of React, Node.js, and RESTful APIs.

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd global-voyager
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd ../backend
   npm install
   ```

---

## Environment Setup

The application requires environment variables for Supabase and other configurations. Follow these steps:

1. **Create a `.env` File in the Backend Directory**:
   - In the `backend` directory, create a `.env` file with the following content:
     ```env
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-supabase-anon-key
     PORT=5000
     ```
   - Replace `your-supabase-url` and `your-supabase-anon-key` with the values from your Supabase project (found in the Supabase dashboard under **Settings > API**).

2. **Optional: Frontend Environment Variables**:
   - If needed, create a `.env` file in the `frontend` directory for frontend-specific configurations (e.g., API base URLs).

---

## Running the Application

### Development Mode

1. **Start the Backend**:
   - In the `backend` directory:
     ```bash
     npm start
     ```
   - The backend will run on `http://localhost:5000`.

2. **Start the Frontend**:
   - In the `frontend` directory:
     ```bash
     npm start
     ```
   - The frontend will run on `http://localhost:3000`.

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

### Production Mode

- **Backend**: Use a process manager like `pm2` to run the backend in production:
  ```bash
  pm2 start server.js --name "global-voyager-backend"
  ```
- **Frontend**: Build the frontend and serve it using a static server:
  ```bash
  cd frontend
  npm run build
  serve -s build
  ```

---

## API Endpoints

The backend provides the following API endpoints:

- **`GET /countries`**  
  - Retrieves a list of countries from Supabase.  
  - **Response**: JSON array of countries with `name`, `cca3`, and `flag_url`.

- **`GET /countries/:country`**  
  - Retrieves detailed information for a specific country.  
  - **Response**: JSON object with country details (e.g., `capital`, `population`, `area`, `languages`).

- **`GET /meals/:country`**  
  - Retrieves meal data for a specific country.  
  - **Response**: JSON array of meals with `meal_name`, `meal_image`, `description`, `recipe_link`, and `category`.

- **`GET /populate-meals/:country`**  
  - Populates the meals table for a specific country using TheMealDB API.  
  - **Response**: Success message or error.

- **`GET /populate-all-meals`**  
  - Populates the meals table for all countries (except Canada) using TheMealDB API.  
  - **Response**: Success message or error.

---

## Database Population

The application uses Supabase as its database. To populate the database:

1. **Populate the `countries` Table**:
   - Use the `/populate-countries` endpoint (if implemented) or manually insert data using the Supabase dashboard.

2. **Populate the `meals` Table**:
   - Use the `/populate-meals/:country` endpoint for a specific country:
     ```bash
     curl http://localhost:5000/populate-meals/Canada
     ```
   - Use the `/populate-all-meals` endpoint to populate meals for all countries (except Canada):
     ```bash
     curl http://localhost:5000/populate-all-meals
     ```

- **Duplicate Checking**: The population endpoints include checks to avoid inserting duplicate meals.

---

## Troubleshooting

### Common Issues and Solutions

1. **Map Lag with Large Datasets**  
   - **Issue**: The 3D globe may lag when displaying many countries.  
   - **Solution**: Reduce the number of markers or optimize the globe’s rendering settings (e.g., lower `pointRadius` or `labelSize`).

2. **API Errors When Fetching Meals**  
   - **Issue**: TheMealDB API may not have data for certain countries.  
   - **Solution**: Ensure the `cuisineMapping` in `server.js` includes only supported cuisines. Check the API’s supported areas with `https://www.themealdb.com/api/json/v1/1/list.php?a=list`.

3. **Supabase Connection Issues**  
   - **Issue**: The backend fails to connect to Supabase.  
   - **Solution**: Verify that the `SUPABASE_URL` and `SUPABASE_KEY` in the `.env` file are correct and that your Supabase project is active.

4. **Video Embedding Fails**  
   - **Issue**: The recipe video does not embed properly.  
   - **Solution**: Ensure the `recipe_link` is a valid YouTube URL. The `convertToEmbedUrl` function in `CountryPage.js` should handle the conversion.

5. **Cross-Browser Compatibility**  
   - **Issue**: Features like the 3D globe or video embedding may not work in all browsers.  
   - **Solution**: Test the application in Chrome, Firefox, Edge, and Safari. Adjust the code to handle browser-specific issues (e.g., WebGL support for the globe).

---

## Known Bugs

- **Map Lag**: The 3D globe may experience performance issues with large datasets.  
- **Video Embedding**: Some recipe links may not embed correctly if they are not from YouTube or if the URL format changes.

---

## Roadmap

- [x] Add 3D globe option (completed)
- [ ] Expand cultural data sources (e.g., integrate additional APIs for more cultural insights)
- [ ] Implement user authentication for personalized features
- [ ] Add more interactive visualizations (e.g., population growth charts)

---
