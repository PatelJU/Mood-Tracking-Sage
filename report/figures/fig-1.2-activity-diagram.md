# Figure 1.2: Activity Diagram for Mood Logging Process

```
+----------------------------------------------------------+
|                                                          |
|  +----------+                                            |
|  |  Start   |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+                                            |
|  |  Click   |                                            |
|  |  "Log    |                                            |
|  |  Mood"   |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+                                            |
|  | Select   |                                            |
|  | Time of  |                                            |
|  | Day      |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+                                            |
|  | Select   |                                            |
|  | Mood     |                                            |
|  | Level    |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +--------------------+                                  |
|  | Add Optional Info  |                                  |
|  |--------------------|                                  |
|  | - Notes            |                                  |
|  | - Activities       |                                  |
|  | - Journal Entry    |                                  |
|  +--------------------+                                  |
|       |                                                  |
|       v                                                  |
|  +----------+     No     +------------------+            |
|  | Weather  |----------->| Continue without |            |
|  | Data     |            | Weather Data     |            |
|  | Available|            +------------------+            |
|  +----------+                   |                        |
|       | Yes                     |                        |
|       v                         |                        |
|  +----------+                   |                        |
|  | Add      |                   |                        |
|  | Weather  |<------------------+                        |
|  | Data     |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+                                            |
|  | Submit   |                                            |
|  | Mood     |                                            |
|  | Entry    |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+                                            |
|  | Display  |                                            |
|  | Success  |                                            |
|  | Message  |                                            |
|  +----------+                                            |
|       |                                                  |
|       v                                                  |
|  +----------+     Yes     +------------------+           |
|  | Want to  |------------>| Navigate to      |           |
|  | View     |             | Dashboard/Charts |           |
|  | Results? |             +------------------+           |
|  +----------+                    |                       |
|       | No                       |                       |
|       v                          |                       |
|  +----------+                    |                       |
|  |  End     |<-------------------+                       |
|  +----------+                                            |
|                                                          |
+----------------------------------------------------------+
```

This activity diagram illustrates the step-by-step process of logging a mood entry in the Pro Mood Tracker application. The process begins when a user clicks the "Log Mood" button and follows a logical sequence of selecting the time of day and mood level. Users can then add optional information such as notes, activities, and journal entries. The system checks for weather data availability and incorporates it if present. After submitting the entry, users can view their results on the dashboard or charts or end the session. This diagram highlights the application's user-friendly approach to mood tracking with both required and optional steps clearly defined. 