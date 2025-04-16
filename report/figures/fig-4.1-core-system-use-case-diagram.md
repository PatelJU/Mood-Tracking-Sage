```mermaid
graph TB
    %% Styles
    classDef user fill:#f9d71c,stroke:#333,stroke-width:2px
    classDef system fill:#f8f9fa,stroke:#333,stroke-width:1px,color:#333
    classDef usecase fill:#e9f5fe,stroke:#333,stroke-width:1px,color:#333,rx:5,ry:5
    
    %% Actors
    user((User)):::user
    
    %% System boundary
    subgraph ProMoodTracker["Pro Mood Tracker System"]
        %% Use Cases - Authentication & User Management
        login[Login/Authentication]:::usecase
        register[Register Account]:::usecase
        manageProfile[Manage User Profile]:::usecase
        
        %% Use Cases - Core Functionality
        recordMood[Record Mood Entry]:::usecase
        trackFactors[Track Influencing Factors]:::usecase
        viewHistory[View Mood History]:::usecase
        viewInsights[View Mood Insights & Trends]:::usecase
        
        %% Use Cases - Engagement Features
        manageRewards[Earn & Manage Rewards]:::usecase
        customizeApp[Customize App Theme]:::usecase
        setReminders[Set Mood Tracking Reminders]:::usecase
        
        %% Use Cases - Data Management
        exportData[Export Mood Data]:::usecase
        backupData[Backup & Restore Data]:::usecase
    end
    
    %% Relationships
    user --> login
    user --> register
    user --> manageProfile
    user --> recordMood
    user --> trackFactors
    user --> viewHistory
    user --> viewInsights
    user --> manageRewards
    user --> customizeApp
    user --> setReminders
    user --> exportData
    user --> backupData
    
    %% Dependencies
    login -.-> viewHistory
    login -.-> viewInsights
    login -.-> recordMood
    login -.-> manageProfile
    recordMood -.-> trackFactors
    recordMood -.-> manageRewards
    viewHistory -.-> viewInsights
    
    %% Extended
    customizeApp -.-> "Change Colors"
    customizeApp -.-> "Toggle Dark Mode"
    recordMood -.-> "Add Notes"
    recordMood -.-> "Rate Mood"
    recordMood -.-> "Add Activities"
    trackFactors -.-> "Track Weather"
    trackFactors -.-> "Track Activities"
    viewInsights -.-> "View Correlations"
    viewInsights -.-> "View Patterns"
```

## Figure 4.1: Core System Use Case Diagram

The Core System Use Case Diagram for the Pro Mood Tracker application illustrates the primary interactions between the user and the system. This diagram captures the essential functionalities that form the backbone of the application.

### Key Components

1. **User Authentication & Management**:
   - The user can register for a new account, login to an existing account, and manage their profile settings.
   - These foundational actions provide the security framework for the application.

2. **Core Mood Tracking Functionality**:
   - Users can record mood entries, which is the central feature of the application.
   - Mood entries can be enhanced with notes, activity tracking, and other influencing factors.
   - Users can view their mood history and access insights about their mood patterns.

3. **Engagement Features**:
   - The reward system encourages consistent usage by providing achievements and badges.
   - Customization options allow users to personalize the application's appearance.
   - Reminders help users maintain a consistent mood tracking routine.

4. **Data Management**:
   - Users can export their mood data for external analysis or record-keeping.
   - Backup and restore functionality ensures data persistence across devices.

### Relationships and Dependencies

The diagram shows dependencies between use cases, indicated by dotted lines. For example:
- Login is required before accessing most other features.
- Recording moods enables the tracking of influencing factors and earning rewards.
- Viewing history is a prerequisite for accessing deeper insights and trends.

This use case diagram serves as a blueprint for the application's functionality, highlighting the user-centered design approach where all features are accessible to the user with clear relationships between dependent functions. 