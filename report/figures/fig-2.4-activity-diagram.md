# Figure 2.4: Activity Diagram for Theme Customization Process

```
+----------------------------------------------------------------------+
|                                                                      |
|                  Theme Customization Process                         |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|    +----------+                                                      |
|    |  Start   |                                                      |
|    +----------+                                                      |
|         |                                                            |
|         v                                                            |
|    +------------------+                                              |
|    | User Navigates   |                                              |
|    | to Theme Page    |                                              |
|    +------------------+                                              |
|         |                                                            |
|         v                                                            |
|    +------------------+                                              |
|    | Load Current     |                                              |
|    | Theme Settings   |                                              |
|    +------------------+                                              |
|         |                                                            |
|         v                                                            |
|    +------------------+                                              |
|    | Display Theme    |                                              |
|    | Options          |                                              |
|    +------------------+                                              |
|         |                                                            |
|         |<-----------------------------------------+                 |
|         v                                          |                 |
|    +------------------+                            |                 |
|    | User Selects     |                            |                 |
|    | Theme Option     |                            |                 |
|    +------------------+                            |                 |
|         |                                          |                 |
|         v                                          |                 |
|    +------------------+     Yes     +-------------+|                 |
|    | Selected Built-in|------------>| Load        ||                 |
|    | Theme?           |             | Predefined  ||                 |
|    +------------------+             | Theme       ||                 |
|         | No                        +-------------+|                 |
|         v                                  |       |                 |
|    +------------------+                    |       |                 |
|    | Display Color    |<-------------------+       |                 |
|    | Customization    |                            |                 |
|    +------------------+                            |                 |
|         |                                          |                 |
|         v                                          |                 |
|    +------------------+                            |                 |
|    | User Adjusts     |                            |                 |
|    | Colors/Settings  |                            |                 |
|    +------------------+                            |                 |
|         |                                          |                 |
|         v                                          |                 |
|    +------------------+                            |                 |
|    | Preview Theme    |                            |                 |
|    | Changes          |                            |                 |
|    +------------------+                            |                 |
|         |                                          |                 |
|         v                                          |                 |
|    +------------------+     No      +--------------+                 |
|    | User Satisfied?  |------------>| Continue     |                 |
|    |                  |             | Adjustments  |---------------->+
|    +------------------+             +--------------+                 |
|         | Yes                                                        |
|         v                                                            |
|    +------------------+                                              |
|    | Save Theme       |                                              |
|    | Settings         |                                              |
|    +------------------+                                              |
|         |                                                            |
|         v                                                            |
|    +------------------+     Yes     +--------------+                 |
|    | Save as Custom   |------------>| Enter Theme  |                 |
|    | Theme?           |             | Name         |                 |
|    +------------------+             +--------------+                 |
|         | No                               |                         |
|         |<-----------------------------------                        |
|         v                                                            |
|    +------------------+                                              |
|    | Apply Theme to   |                                              |
|    | Application      |                                              |
|    +------------------+                                              |
|         |                                                            |
|         v                                                            |
|    +------------------+                                              |
|    | Display Success  |                                              |
|    | Message          |                                              |
|    +------------------+                                              |
|         |                                                            |
|         v                                                            |
|    +------------------+                                              |
|    | End Theme        |                                              |
|    | Customization    |                                              |
|    +------------------+                                              |
|                                                                      |
+----------------------------------------------------------------------+
```

This activity diagram illustrates the theme customization process in the Pro Mood Tracker application. The process begins when a user navigates to the Theme page, where the system loads and displays current theme settings and available options. The user selects a theme option, which can either be a built-in theme or a custom one. If the user selects a built-in theme, the system loads predefined settings; otherwise, it displays color customization options. The user can adjust colors and settings while previewing changes in real-time. If not satisfied, the user can continue making adjustments until the desired look is achieved. Once satisfied, the user saves the theme settings, with an option to save as a custom theme with a unique name. The system then applies the selected theme to the entire application and displays a success message. This process demonstrates the application's focus on personalization and user experience, allowing users to tailor the visual aspects of the application to their preferences. 