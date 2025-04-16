```mermaid
erDiagram
    USER {
        string id PK
        string username
        string email
        string password_hash
        date created_at
        date last_login
        json preferences
        int streak_days
        int total_points
    }
    
    MOOD_ENTRY {
        string id PK
        string user_id FK
        date entry_date
        time entry_time
        int mood_rating
        string notes
        json location_data
        json weather_data
    }
    
    ACTIVITY {
        string id PK
        string name
        string icon
        string category
    }
    
    MOOD_ACTIVITY {
        string mood_entry_id FK
        string activity_id FK
        int impact_rating
    }
    
    ACHIEVEMENT {
        string id PK
        string name
        string description
        int points_value
        string badge_icon
        string criteria_type
        json criteria_value
    }
    
    USER_ACHIEVEMENT {
        string user_id FK
        string achievement_id FK
        date earned_date
        boolean is_viewed
    }
    
    THEME {
        string id PK
        string name
        string description
        json color_scheme
        boolean is_system
    }
    
    USER_THEME {
        string user_id FK
        string theme_id FK
        boolean is_active
        date last_used
    }
    
    REMINDER {
        string id PK
        string user_id FK
        time reminder_time
        json active_days
        boolean is_enabled
        string message
    }
    
    USER ||--o{ MOOD_ENTRY : "tracks"
    USER ||--o{ REMINDER : "sets"
    USER ||--o{ USER_ACHIEVEMENT : "earns"
    USER ||--o{ USER_THEME : "customizes"
    
    MOOD_ENTRY ||--o{ MOOD_ACTIVITY : "includes"
    ACTIVITY ||--o{ MOOD_ACTIVITY : "categorizes"
    
    ACHIEVEMENT ||--o{ USER_ACHIEVEMENT : "awarded as"
    THEME ||--o{ USER_THEME : "selected as"
```

## Figure 4.2: Entity Relationship Diagram

The Entity Relationship Diagram (ERD) illustrates the database structure for the Pro Mood Tracker application, showing the relationships between different entities that store and organize application data.

### Primary Entities

1. **USER**: 
   - Central entity storing user authentication and profile information
   - Tracks user engagement metrics like streak days and points
   - Stores user preferences as a JSON object for flexibility

2. **MOOD_ENTRY**:
   - Core data entity capturing mood tracking information
   - Linked to users through a foreign key relationship
   - Stores contextual information like location and weather data
   - Contains the primary mood rating and optional notes

3. **ACTIVITY**:
   - Reference table for predefined and user-created activities
   - Categorized to allow for organizational grouping
   - Includes visual representation (icon) for UI display

4. **ACHIEVEMENT**:
   - Defines gamification elements to encourage app engagement
   - Contains criteria for earning achievements stored as flexible JSON
   - Associates point values and visual badges with accomplishments

5. **THEME**:
   - Enables UI customization through predefined and custom themes
   - Stores color schemes as JSON for flexible styling options
   - Distinguishes between system defaults and user-created themes

### Junction Tables

1. **MOOD_ACTIVITY**:
   - Links mood entries with associated activities
   - Allows tracking impact rating of activities on mood
   - Enables many-to-many relationship between entries and activities

2. **USER_ACHIEVEMENT**:
   - Tracks which achievements have been earned by which users
   - Records when achievements were earned
   - Tracks viewing status for notification purposes

3. **USER_THEME**:
   - Manages theme preferences for each user
   - Tracks active theme and usage history

### Key Relationships

- Each user can have multiple mood entries, reminders, achievements, and themes
- Mood entries can be associated with multiple activities through the junction table
- Achievements and themes are reusable across users with personalized tracking
- All entity relationships maintain referential integrity through foreign key constraints

This database design supports the core functionality of mood tracking while enabling engagement features like achievements and customization options that enhance the user experience. 