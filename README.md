# Resolv - Maintenance Issue Management System

Resolv is a React-based web application for managing maintenance issues, built with Firebase integration for real-time data management.

## Features

- 🏠 **Home Page**: Submit maintenance issues with image upload
- 🛠 **Admin Dashboard**: View and manage all issues with status tracking
- 👷 **Contractor Dashboard**: View assigned tasks and update progress
- 📊 **Status Progress**: Visual timeline showing issue resolution progress
- 🔥 **Firebase Integration**: Real-time database and storage
- 🤖 **AI Integration**: Gemini API for intelligent issue categorization

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS, PostCSS

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Siddarth-01/Resolv.git
cd Resolv
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase configuration in `src/firebase.js`

4. Configure Gemini API key in `src/api/gemini.js`

### Available Scripts

#### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── IssueCard.jsx   # Individual issue display
│   ├── IssueList.jsx   # List of issues
│   ├── StatusProgress.jsx # Progress timeline
│   └── UploadForm.jsx  # Issue submission form
├── pages/              # Main application pages
│   ├── AdminDashboard.jsx    # Admin interface
│   ├── ContractorDashboard.jsx # Contractor interface
│   └── Home.jsx        # Landing/submission page
├── api/                # External API integrations
│   └── gemini.js       # Google Gemini API client
├── utils/              # Utility functions
│   ├── assignTechnician.js
│   └── predictCategory.js
└── firebase.js         # Firebase configuration
```

## Features Overview

### Issue Management
- Upload images of maintenance issues
- Automatic categorization using AI
- Real-time status updates
- Progress tracking with visual timeline

### Dashboard Views
- **Admin**: Complete oversight of all issues
- **Contractor**: Focused view of assigned tasks
- Real-time updates across all dashboards

### Status Workflow
1. **Open** - Issue submitted
2. **Assigned** - Technician assigned
3. **Resolved** - Issue completed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
