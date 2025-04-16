# Figure 2.3: Use Case Diagram for Rewards System

```
+-----------------------------------------------------------------------+
|                                                                       |
|                          Rewards System                               |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|    +-------+                                                          |
|    |       |                                                          |
|    | User  |                                                          |
|    |       |                                                          |
|    +-------+                                                          |
|        |                                                              |
|        |                                                              |
|        |                               +--------------------+         |
|        |                               |                    |         |
|        |                               |  <<extend>>        |         |
|        +------------------------------>+------------------+ |         |
|        |                               |                  | |         |
|        | Log Mood                      | Increase Daily   | |         |
|        |                               | Streak Counter   | |         |
|        |                               |                  | |         |
|        |                               +------------------+ |         |
|        |                                        |           |         |
|        |                                        | <<extend>>|         |
|        |                                        v           |         |
|        |                               +------------------+ |         |
|        |                               |                  | |         |
|        |                               | Earn Streak      | |         |
|        |                               | Points           | |         |
|        |                               |                  | |         |
|        |                               +------------------+ |         |
|        |                                                    |         |
|        |                                                    |         |
|        |                                                    |         |
|        |                               +--------------------+         |
|        |                                                              |
|        |                               +--------------------+         |
|        |                               |                    |         |
|        |                               |  <<extend>>        |         |
|        +------------------------------>+------------------+ |         |
|        |                               |                  | |         |
|        | Complete Achievement          | Earn Achievement | |         |
|        | Criteria                      | Badge            | |         |
|        |                               |                  | |         |
|        |                               +------------------+ |         |
|        |                                        |           |         |
|        |                                        | <<extend>>|         |
|        |                                        v           |         |
|        |                               +------------------+ |         |
|        |                               |                  | |         |
|        |                               | Earn Achievement | |         |
|        |                               | Points           | |         |
|        |                               |                  | |         |
|        |                               +------------------+ |         |
|        |                                                    |         |
|        |                                                    |         |
|        +------------------------------>+--------------------+         |
|        |                               |                              |
|        | View Rewards                  | View Badges                  |
|        |                               |                              |
|        |                               +------------------------------+|
|        |                               |                              |
|        |                               | View Points                  |
|        |                               |                              |
|        |                               +------------------------------+|
|        |                               |                              |
|        |                               | View Streaks                 |
|        |                               |                              |
|        |                               +------------------------------+|
|        |                               |                              |
|        |                               | View Leaderboard (Future)    |
|        |                               |                              |
|        |                               +-----------------------------+ |
|        |                                                              |
|        |                                                              |
|        +------------------------------>+-----------------------------+ |
|        |                               |                             | |
|        | Redeem Points (Future)        | Unlock Premium Features     | |
|        |                               |                             | |
|        |                               +-----------------------------+ |
|        |                                                              |
+-----------------------------------------------------------------------+
```

This use case diagram illustrates the rewards system functionality within the Pro Mood Tracker application. The primary actor is the User who can engage with the system through several key use cases. When a User logs a mood, this extends to increasing their daily streak counter, which further extends to earning streak points. Similarly, when a User completes achievement criteria, they earn an achievement badge and associated points. Users can view their rewards, including badges, points, and streaks, with a future feature for leaderboard comparison. The diagram also shows a potential future feature allowing users to redeem points for premium features. This gamification system encourages consistent use of the application and provides users with a sense of accomplishment as they track their moods regularly.