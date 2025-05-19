# Global Voyager

## Description
Global Voyager is an interactive web application that provides comprehensive information about countries worldwide, including geographical, demographic, and cultural data, with engaging visualizations.

## Target Browsers
Works on contemporary desktop browsers (Chrome, Firefox, Edge, Safari).

## Link to Developer Manual
See below.

---

## Developer Manual

### Installation
1. Clone the repository: `git clone <repo-url>`.
2. Install front-end dependencies: `cd frontend && npm install`.
3. Install back-end dependencies: `cd ../backend && npm install`.

### Running the Application
1. Start the back end: `cd backend && npm start`.
2. Start the front end: `cd frontend && npm start`.

### Running Tests
- Run unit tests: `cd frontend && npm test`.

### API Endpoints
- **GET /countries**: Retrieves country data from Supabase.
- **POST /countries**: Saves or processes country data.

### Known Bugs
- Map may lag with large datasets.

### Roadmap
- ~~Add 3D globe option.~~ Done
- Expand cultural data sources.