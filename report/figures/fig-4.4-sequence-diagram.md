```mermaid
sequenceDiagram
    actor User
    participant UI as User Interface
    participant MEC as MoodEntryController
    participant AS as AuthService
    participant MS as MoodEntryService
    participant ACS as ActivityService
    participant WS as WeatherService
    participant LS as LocationService
    participant DB as Database

    User->>UI: Opens "Add Mood" screen
    UI->>ACS: getActivities()
    ACS->>DB: query(activities)
    DB-->>ACS: activities list
    ACS-->>UI: activities list
    UI->>LS: getCurrentLocation()
    LS-->>UI: location data
    UI->>WS: getWeatherData(location)
    WS-->>UI: weather conditions
    UI-->>User: Displays form with activities, weather & location

    User->>UI: Selects mood rating (1-10)
    User->>UI: Selects activities
    User->>UI: Adds optional notes
    User->>UI: Taps "Save" button

    UI->>MEC: createMoodEntry(moodData)
    MEC->>AS: validateSession()
    AS-->>MEC: validation result
    
    alt Invalid Session
        MEC-->>UI: Authentication Error
        UI-->>User: "Please login to continue"
    else Valid Session
        MEC->>MS: saveMoodEntry(userId, moodData)
        MS->>DB: insert(moodEntry)
        DB-->>MS: success status
        
        par Process Activities
            MS->>DB: insertMoodActivities(moodId, activities)
            DB-->>MS: success status
        and Check Achievements
            MS->>DB: checkAndUpdateAchievements(userId)
            DB-->>MS: updated achievements
        end
        
        MS-->>MEC: success result
        MEC-->>UI: confirmation
        UI-->>User: "Mood saved successfully"
        
        opt New Achievement Earned
            UI-->>User: Shows achievement notification
        end
    end
```

## Figure 4.4: Sequence Diagram - Adding a Mood Entry

This sequence diagram illustrates the process of adding a new mood entry in the Pro Mood Tracker application, showing the interactions between the user, interface, and various system components.

### Process Flow

1. **Initial Setup**
   - User opens the "Add Mood" screen
   - The system retrieves available activities from the database
   - Location and weather data are automatically collected to provide context

2. **User Input**
   - User selects a mood rating on a scale of 1-10
   - User selects relevant activities that influenced their mood
   - User can add optional notes for additional context
   - User submits the entry by tapping "Save"

3. **Processing and Validation**
   - The system validates the user's authentication session
   - If authentication fails, the user is prompted to log in
   - If authenticated, the mood entry processing continues

4. **Data Storage**
   - The mood entry is saved to the database
   - Associated activities are linked to the mood entry
   - The system checks if any achievements have been unlocked

5. **Feedback to User**
   - Confirmation is displayed when the mood entry is saved
   - If a new achievement is earned, a notification is shown

### Key Components

- **User Interface**: Handles data collection and display of information
- **Controllers**: Manage workflow and communication between components
- **Services**: Provide specialized functionality (authentication, mood entries, activities)
- **External Services**: Provide contextual data (weather, location)
- **Database**: Stores all persistent data

This sequence demonstrates the application's user-centered design while highlighting the behind-the-scenes processes that enhance the mood tracking experience with contextual data and achievement recognition. 