```mermaid
stateDiagram-v2
    title Pro Mood Tracker - Application State Diagram

    [*] --> AppInitializing
    
    state AppInitializing {
        [*] --> CheckingDependencies
        CheckingDependencies --> LoadingConfiguration
        LoadingConfiguration --> CheckingAuthStatus
    }
    
    AppInitializing --> Unauthenticated : No valid session
    AppInitializing --> Authenticated : Valid session exists
    
    state Unauthenticated {
        [*] --> LoginScreen
        
        state LoginScreen {
            [*] --> AwaitingCredentials
            AwaitingCredentials --> ProcessingLogin : Submit login
            ProcessingLogin --> AwaitingCredentials : Login failed
        }
        
        LoginScreen --> RegisterScreen : Switch to register
        
        state RegisterScreen {
            [*] --> CollectingUserInfo
            CollectingUserInfo --> CreatingAccount : Submit registration
            CreatingAccount --> CollectingUserInfo : Registration failed
        }
        
        RegisterScreen --> LoginScreen : Switch to login
        
        state ResetPasswordScreen {
            [*] --> EnteringEmail
            EnteringEmail --> SendingResetLink : Submit email
            SendingResetLink --> ResetLinkSent : Success
            SendingResetLink --> EnteringEmail : Failed
        }
        
        LoginScreen --> ResetPasswordScreen : Forgot password
        ResetPasswordScreen --> LoginScreen : Back to login
    }
    
    Unauthenticated --> Authenticated : Successful authentication
    Authenticated --> Unauthenticated : Logout
    
    state Authenticated {
        [*] --> LoadingUserData
        
        LoadingUserData --> FirstTimeSetup : First login
        LoadingUserData --> Dashboard : Data loaded
        
        state FirstTimeSetup {
            [*] --> OnboardingTutorial
            OnboardingTutorial --> PreferencesSetup
            PreferencesSetup --> NotificationSetup
            NotificationSetup --> InitialMoodEntry
            InitialMoodEntry --> Dashboard
        }
        
        state Dashboard {
            [*] --> ViewingSummary
            ViewingSummary --> ViewingHistory : Navigate to history
            ViewingHistory --> ViewingSummary : Back to summary
            ViewingSummary --> ViewingInsights : Navigate to insights
            ViewingInsights --> ViewingSummary : Back to summary
        }
        
        Dashboard --> MoodEntryFlow : Add new entry
        MoodEntryFlow --> Dashboard : Entry completed
        
        state MoodEntryFlow {
            [*] --> SelectingMood
            SelectingMood --> SelectingFactors : Next step
            SelectingFactors --> AddingContext : Next step
            AddingContext --> EnteringNotes : Next step
            EnteringNotes --> AttachingMedia : Add media
            EnteringNotes --> ReviewingEntry : Skip media
            AttachingMedia --> ReviewingEntry : Next step
            ReviewingEntry --> SavingEntry : Submit entry
            
            SavingEntry --> EntrySuccess : Saved successfully
            SavingEntry --> EntrySaveError : Save failed
            EntrySaveError --> ReviewingEntry : Try again
            
            SelectingMood --> Dashboard : Cancel
            SelectingFactors --> Dashboard : Cancel
            AddingContext --> Dashboard : Cancel
            EnteringNotes --> Dashboard : Cancel
            AttachingMedia --> Dashboard : Cancel
            ReviewingEntry --> Dashboard : Cancel
        }
        
        Dashboard --> InsightsFlow : View insights
        InsightsFlow --> Dashboard : Back to dashboard
        
        state InsightsFlow {
            [*] --> LoadingInsightsData
            LoadingInsightsData --> ViewingTrends : Data loaded
            ViewingTrends --> ViewingPatterns : Change view
            ViewingPatterns --> ViewingTrends : Change view
            ViewingTrends --> FilteringInsights : Apply filter
            ViewingPatterns --> FilteringInsights : Apply filter
            FilteringInsights --> ViewingTrends : Update view
            FilteringInsights --> ViewingPatterns : Update view
        }
        
        Dashboard --> SettingsFlow : Open settings
        SettingsFlow --> Dashboard : Back to dashboard
        
        state SettingsFlow {
            [*] --> ViewingSettings
            ViewingSettings --> EditingProfile : Edit profile
            ViewingSettings --> ManagingNotifications : Manage notifications
            ViewingSettings --> ConfiguringPrivacy : Configure privacy
            ViewingSettings --> ManagingData : Manage data
            
            EditingProfile --> SavingSettings : Save changes
            ManagingNotifications --> SavingSettings : Save changes
            ConfiguringPrivacy --> SavingSettings : Save changes
            ManagingData --> SavingSettings : Save changes
            
            SavingSettings --> ViewingSettings : Changes saved
            SavingSettings --> SettingsSaveError : Save failed
            SettingsSaveError --> ViewingSettings : Try again
        }
    }
    
    state NetworkState <<fork>>
    Authenticated --> NetworkState
    NetworkState --> Online : Connected
    NetworkState --> Offline : No connection
    
    state Online {
        [*] --> SyncingData
        SyncingData --> SyncComplete : Sync successful
        SyncingData --> SyncError : Sync failed
        SyncError --> SyncingData : Retry sync
    }
    
    state Offline {
        [*] --> UsingLocalData
        UsingLocalData --> WaitingForConnection : Detect network
    }
    
    Online --> Offline : Connection lost
    Offline --> Online : Connection restored
    
    state AppTerminating {
        [*] --> SavingApplicationState
        SavingApplicationState --> CleaningUpResources
    }
    
    Authenticated --> AppTerminating : Exit app
    Unauthenticated --> AppTerminating : Exit app
    AppTerminating --> [*]
```

## Figure 4.18: State Diagram - Pro Mood Tracker Application

This state diagram illustrates the main states and transitions in the Pro Mood Tracker application, showing how the application progresses through different states as users interact with it.

### Key State Groups:

#### 1. Application Lifecycle States
- **App Initializing**: Startup sequence including dependency checks, configuration loading, and authentication status verification.
- **App Terminating**: Graceful shutdown sequence saving application state and cleaning up resources.

#### 2. Authentication States
- **Unauthenticated**: States related to user authentication, including login, registration, and password reset.
- **Authenticated**: States available after successful authentication, including the main application functionality.

#### 3. Core Functionality States
- **Dashboard**: The main hub showing mood summaries, history, and access to other features.
- **Mood Entry Flow**: The sequence of states for recording a new mood entry.
- **Insights Flow**: States related to viewing and analyzing mood data.
- **Settings Flow**: States for managing user preferences and application configuration.

#### 4. Network-Related States
- **Online**: States when the application has internet connectivity.
- **Offline**: States when the application operates without internet connectivity.

### Key Transitions and Behaviors:

1. **Authentication Transitions**: The application starts by checking authentication status and transitions to either Unauthenticated or Authenticated states accordingly.

2. **First-Time User Experience**: New users go through a special onboarding flow to set up preferences and learn the application.

3. **Mood Recording Process**: The mood entry flow follows a step-by-step process, allowing users to cancel at any point.

4. **Network Adaptability**: The application smoothly transitions between online and offline states, maintaining functionality in both modes.

5. **Error Handling**: Various error states (EntrySaveError, SettingsSaveError, SyncError) provide paths for recovery and retrying operations.

6. **Navigation Patterns**: The diagram shows how users can navigate between different sections of the application while maintaining context.

This state diagram demonstrates the Pro Mood Tracker's comprehensive approach to managing application state, ensuring a consistent user experience across different scenarios and conditions. The design accounts for various user journeys, error conditions, and network states, providing a robust foundation for the application's behavior. 