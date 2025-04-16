# Pro Mood Tracker

A comprehensive mood tracking application that helps users log, visualize, and analyze their moods over time. This application serves as a personal diary for emotional well-being, providing deep insights into mood patterns and offering suggestions for improvement.

## Features

### User Authentication
- Secure registration and login system
- Password reset functionality
- User profile management

### Mood Logging
- Color-coded mood entries (Very Bad, Bad, Okay, Good, Very Good)
- Time period selection (morning, afternoon, evening, night, full-day)
- Notes for each mood entry
- Weather data integration

### Visualization
- Interactive calendar with color-coded mood indicators
- Multiple chart types:
  - Line graphs for mood trends
  - Bar charts for mood distribution
  - Radar/Spider charts for time-of-day analysis
  - Correlation charts for weather impact

### Analytics
- Mood statistics and trends
- Day of week analysis
- Time of day patterns
- Weather correlation insights
- Mood predictions based on historical data

### History
- Searchable mood history
- Filter by mood, date, and time of day
- Detailed view of past entries
- Edit and delete functionality

### Rewards System
- Points for consistent logging
- Badges for achievements
- Streak tracking
- Progress visualization

### Customization
- Multiple theme options:
  - Light
  - Dark
  - Ocean
  - Sunset
  - Forest
  - Pastel

### Data Management
- Export options (JSON, CSV)
- Email functionality
- Data privacy controls

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router
- **State Management**: React Context API
- **Charts**: Recharts, Chart.js
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pro-mood-tracker.git
   cd pro-mood-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
mood-tracker/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── auth/
│   │   ├── charts/
│   │   ├── history/
│   │   ├── layout/
│   │   ├── mood/
│   │   ├── rewards/
│   │   ├── themes/
│   │   └── utils/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

## Usage

1. **Register/Login**: Create an account or log in to access your personal mood tracker.
2. **Log a Mood**: Click on "Log Mood" to record your current emotional state.
3. **View Calendar**: See your moods displayed on a color-coded calendar.
4. **Analyze Trends**: Visit the Analytics section to gain insights into your mood patterns.
5. **Check History**: Browse through your past entries in the History section.
6. **Earn Rewards**: Track your progress and earn badges in the Rewards section.
7. **Customize**: Change the application theme in Settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Material-UI for the component library
- Recharts and Chart.js for visualization components
- All the open-source libraries that made this project possible
