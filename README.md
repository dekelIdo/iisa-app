<<<<<<< HEAD
# IISA - Israeli Imaginary Space Agency

A clean Angular 19 application for managing space mission candidates.

## Features

### Registration Page
- Responsive form with Angular Reactive Forms
- Image upload (JPEG/PNG)
- LocalStorage data persistence
- 3-day edit window for submissions
- Mobile and desktop responsive

### Dashboard
- Real-time candidate data visualization
- Charts: Age distribution, city breakdown, visits vs registrations
- Interactive map showing candidate locations
- Search and filter functionality
- Individual candidate detail view with navigation

## Technology Stack
- Angular 19 (TypeScript)
- Angular Material (UI components)
- Chart.js with ng2-charts
- Leaflet for maps
- LocalStorage for data persistence
- RxJS for reactive programming

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
ng serve
```

3. Navigate to `http://localhost:4200`

## Usage

- **Registration Page**: Submit applications for space missions
- **Dashboard**: View and manage candidate data with live updates
- **Charts**: Visualize candidate demographics and engagement
- **Map**: See candidate locations across Israel
- **Filters**: Search by name, city, and age range

## Data Storage
All data is stored locally in the browser using LocalStorage.
