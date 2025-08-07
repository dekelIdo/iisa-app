# IISA - Israeli Imaginary Space Agency

A clean Angular 19 application for managing space mission candidates, and a management dashboard for IISA’s recruiting team with nice login authentication.
Please use the password - 'reflectiz' to login.
You can visit here - https://iisa-app.onrender.com

For instructions to run locally please scroll to the end of the README


### Dashboard
- Real-time candidate data visualization
- Charts: Age distribution, city breakdown, visits vs registrations
- Interactive map showing candidate locations
- Search and filter functionality
- Individual candidate detail view with navigation

<img width="937" height="816" alt="image" src="https://github.com/user-attachments/assets/f83ad201-4286-423a-aa75-4d6d715058b0" />


  
### Registration Page
- Responsive form with Angular Reactive Forms
- Validations with reactive form
- Image upload (JPEG/PNG)
- LocalStorage data persistence
- 3-day edit window for submissions
  
<img width="937" height="907" alt="image" src="https://github.com/user-attachments/assets/837bd9d1-1c97-40d1-b5f1-8c236c38620b" />

### Candidate list with filters and sorting
<img width="937" height="807" alt="image" src="https://github.com/user-attachments/assets/fb717721-b6cc-42ad-a09d-13a4b9af7cb9" />


## Responsive design all system 
<img width="937" height="846" alt="Responsive screens" src="https://github.com/user-attachments/assets/4a26bc47-15bd-4f42-95df-1321ddd21075" />

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
