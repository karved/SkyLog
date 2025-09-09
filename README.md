# SkyLog ✈️

A modern flight tracking web application built with Angular 17 and Firebase, featuring magic link authentication, Google Sign-In, and real-time flight logging with API integration.

## Features

- **Dual Authentication**: Magic link email authentication and Google Sign-In
- **Advanced Flight Logging**: Log flights with comprehensive details including roundtrip support
- **Custom Date & Time Pickers**: Beautiful, accessible custom date and time selection components with modal interfaces
- **Real-time Updates**: Flight history updates in real-time using Firestore
- **Flight History Display**: Shows total count of logged flights with real-time updates
- **API Integration**: Submits flight data to external API challenge endpoint
- **Smart Airport/Airline Selection**: Auto-complete dropdowns with US airports and airlines
- **Data Persistence**: Form data automatically saves and restores on page refresh using localStorage
- **Smart Persistence Management**: Automatically clears all user data on logout for security
- **Form Validation**: Comprehensive validation with real-time error messages and constraints
- **Flight Number Validation**: Smart validation for flight numbers (1-3 letters + 1-4 digits)
- **Guest Count Limits**: Configurable guest count with validation (1-100 guests)
- **Autofill Detection**: Handles browser autofill to prevent data loss
- **Responsive Design**: Beautiful travel-booking inspired UI with TailwindCSS
- **Protected Routes**: Secure routing with authentication guards

## Tech Stack

- **Frontend**: Angular 17+ with standalone components and lazy loading
- **Styling**: TailwindCSS with Montserrat font and custom animations
- **Date/Time Handling**: date-fns library for date manipulation and formatting
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Database**: Cloud Firestore with security rules
- **Authentication**: Firebase Auth with magic link and Google Sign-In
- **API Integration**: HTTP client for external flight data submission

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── custom-date-picker/     # Custom date picker with calendar modal
│   │   ├── custom-time-picker/     # Custom time picker with time controls
│   │   ├── dashboard/              # Main dashboard with flight form and history
│   │   ├── login/                  # Magic link and Google authentication
│   │   └── logout/                 # Logout component
│   ├── constants/
│   │   ├── us-airports.constants.ts  # US airports and airlines data
│   │   └── flight.constants.ts       # Flight-related constants
│   ├── guards/
│   │   └── auth.guard.ts           # Route protection
│   ├── services/
│   │   ├── auth.service.ts         # Authentication service (magic link + Google)
│   │   ├── error-handler.service.ts # Error handling service
│   │   └── flight.service.ts       # Flight data and API service
│   ├── app.component.ts            # Root component
│   └── app.routes.ts               # Application routing with lazy loading
├── environment.ts                  # Development environment config
├── environment.prod.ts             # Production environment config
└── styles.css                     # Global styles with TailwindCSS
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration. Ensure these files exist:

**`tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#38BDF8', // Sky Blue
        secondary: '#6366F1', // Indigo
        accent: '#FB7185', // Coral
        background: '#F9FAFB', // Light Gray
      }
    },
  },
  plugins: [],
}
```

### 3. Environment Configuration

The application uses Angular environment files for configuration. Update the following files:

**Development (`src/environment.ts`):**
```typescript
export const environment = {
  production: false,
  firebase: {
    projectId: 'your-project-id',
    appId: 'your-app-id',
    storageBucket: 'your-project-id.appspot.com',
    apiKey: 'your-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    messagingSenderId: 'your-sender-id',
    measurementId: 'your-measurement-id'
  },
  api: {
    url: 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge',
    token: 'your-api-token-here'
  },
  server: {
    port: 3000,
    host: 'localhost'
  }
};
```

**Production (`src/environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  firebase: {
    // Same Firebase config as development
  },
  api: {
    // Same API config as development
  },
  server: {
    port: 80,
    host: '0.0.0.0'
  }
};
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Run Development Server

```bash
npm start
```

Navigate to `http://localhost:3000`

**Available Scripts:**
- `npm start` - Start development server on port 3000
- `npm run start:prod` - Start production server on port 80
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm run deploy` - Deploy to Firebase
- `npm run deploy:hosting` - Deploy only hosting
- `npm run deploy:firestore` - Deploy only Firestore rules

## Firestore Schema

### Users Collection
```typescript
{
  id: string,           // Firebase auth UID
  firstName: string,    // User's first name
  lastName: string,     // User's last name
  email: string,        // User's email
  createdAt: Date,      // Account creation timestamp
  lastLogin?: Date      // Last login timestamp
}
```

### Flights Collection
```typescript
{
  id: string,           // Auto-generated document ID
  userId: string,       // Reference to users.id
  from: string,         // Departure airport (e.g., "LAX - Los Angeles")
  to: string,           // Arrival airport (e.g., "JFK - New York")
  date: Date,           // Flight date
  airline: string,      // Airline name
  createdAt: Date,      // Log creation timestamp
  // API Challenge fields
  flightNumber?: string,    // Flight number (e.g., "AA123") - validated format
  arrivalTime?: string,     // Arrival time (e.g., "14:30")
  numOfGuests?: number,     // Number of guests (1-100)
  candidateName?: string,   // Candidate name for API
  comments?: string         // Additional comments
}
```
### Security Rules

The Firestore security rules ensure:
- Users can create their own user document (for signup)
- Users can only read/update their own user document
- Users can only read/write their own flight documents
- All operations require authentication
- Public user creation allows for seamless signup flow
## **Validation Rules:**
- **Flight Numbers**: 1-3 letters followed by 1-4 digits (e.g., "AA123", "BA1234")
- **Guest Count**: Must be between 1 and 100 guests
- **Return Date**: Can be same day or after departure date
- **Required Fields**: All fields except comments are required for submission




## **User Experience:**
- ✅ **No data loss** - Refresh the page, keep your progress
- ✅ **Seamless workflow** - Continue where you left off
- ✅ **Cross-session persistence** - Data survives browser restarts
- ✅ **Automatic cleanup** - Saved data is cleared after successful submission
- ✅ **Security focused** - All data is cleared on logout for privacy

## **Security & Privacy:**
- **Logout Clearing**: All localStorage data is automatically cleared when users log out
- **Data Isolation**: Prevents data leakage between different users on the same device
- **Clean Sessions**: Each new login starts with a fresh, clean form state
- **Magic Link Cleanup**: Temporary authentication data is cleared on logout


## API Integration

The application integrates with the flight info challenge API:
- **Endpoint**: `https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge`
- **Method**: POST
- **Headers**: 
  - `token`: Challenge token
  - `candidate`: User's name
  - `Content-Type`: application/json
- **Payload**: Flight information matching `FlightInfoPayload` interface:
  ```typescript
  {
    airline: string,
    arrivalDate: string,
    arrivalTime: string,
    flightNumber: string,
    numOfGuests: number,
    comments?: string
  }
  ```

## Routes

- `/login` - Magic link and Google authentication (unauthenticated users only)
- `/` - Dashboard with flight form and history (protected)
- `/logout` - Sign out and redirect to login
- `/**` - Redirects to dashboard (catch-all route)

**Note**: All routes use lazy loading for optimal performance.


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
