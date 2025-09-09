# SkyLog ✈️

A modern flight tracking web application built with Angular 17 and Firebase, featuring magic link authentication, Google Sign-In, and real-time flight logging with API integration.

## Features

- **Dual Authentication**: Magic link email authentication and Google Sign-In
- **Advanced Flight Logging**: Log flights with comprehensive details including roundtrip support
- **Real-time Updates**: Flight history updates in real-time using Firestore
- **API Integration**: Submits flight data to external API challenge endpoint
- **Smart Airport/Airline Selection**: Auto-complete dropdowns with US airports and airlines
- **Roundtrip Support**: Log both outbound and return flights in one form
- **Responsive Design**: Beautiful travel-booking inspired UI with TailwindCSS
- **Protected Routes**: Secure routing with authentication guards

## Tech Stack

- **Frontend**: Angular 17+ with standalone components and lazy loading
- **Styling**: TailwindCSS with Montserrat font and custom animations
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Database**: Cloud Firestore with security rules
- **Authentication**: Firebase Auth with magic link and Google Sign-In
- **API Integration**: HTTP client for external flight data submission

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Main dashboard with flight form and history
│   │   ├── login/              # Magic link and Google authentication
│   │   └── logout/             # Logout component
│   ├── constants/
│   │   ├── us-airports.constants.ts  # US airports and airlines data
│   │   └── flight.constants.ts       # Flight-related constants
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection
│   ├── services/
│   │   ├── auth.service.ts     # Authentication service (magic link + Google)
│   │   └── flight.service.ts   # Flight data and API service
│   ├── app.component.ts        # Root component
│   └── app.routes.ts           # Application routing with lazy loading
├── environment.ts              # Development environment config
├── environment.prod.ts         # Production environment config
└── styles.css                 # Global styles with TailwindCSS
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

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

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Run Development Server

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
  flightNumber?: string,    // Flight number (e.g., "AA123")
  arrivalTime?: string,     // Arrival time (e.g., "14:30")
  numOfGuests?: number,     // Number of guests
  candidateName?: string,   // Candidate name for API
  comments?: string         // Additional comments
}
```

## Security Rules

The Firestore security rules ensure:
- Users can create their own user document (for signup)
- Users can only read/update their own user document
- Users can only read/write their own flight documents
- All operations require authentication
- Public user creation allows for seamless signup flow

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
