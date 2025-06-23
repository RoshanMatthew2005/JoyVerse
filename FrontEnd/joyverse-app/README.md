# Joyverse - Taare Zameen Par

A beautiful React application designed for children's therapy and learning, inspired by the concept of "Taare Zameen Par" (Like Stars on Earth).

## Features

- **Welcome Page**: Beautiful animated landing page with floating decorative elements
- **Multi-Role Support**: Separate interfaces for therapists and children
- **Therapist Dashboard**: Track sessions, manage children, and view messages
- **Child Dashboard**: Fun activities, art corner, story time, and achievements
- **Responsive Design**: Works on all device sizes
- **Beautiful UI**: Gradient backgrounds, smooth animations, and child-friendly design

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd joyverse-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing

## Project Structure

```
joyverse-app/
├── src/
│   ├── pages/               # Individual page components
│   │   ├── WelcomePage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── TherapistSignUp.jsx
│   │   ├── ChildSignUp.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ChildDashboard.jsx
│   │   └── index.js         # Page exports
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md               # This file
```

## Features Overview

### For Therapists
- Dashboard with session tracking
- Patient management
- Message center
- Activity monitoring

### For Children
- Fun interactive activities
- Art creation tools
- Story reading section
- Achievement system with badges

## Contributing

This is a learning and therapy platform designed to help children discover their unique talents and abilities, just like the stars in the sky.

## License

This project is created for educational and therapeutic purposes.
