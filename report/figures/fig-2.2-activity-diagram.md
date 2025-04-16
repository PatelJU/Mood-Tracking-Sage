# Figure 2.2: Activity Diagram for Mood Analytics Process

```
+-----------------------------------------------------------------------+
|                                                                       |
|                        Mood Analytics Process                         |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|    +----------+                                                       |
|    |  Start   |                                                       |
|    +----------+                                                       |
|         |                                                             |
|         v                                                             |
|    +-------------------+                                              |
|    | User Navigates to |                                              |
|    | Analytics Page    |                                              |
|    +-------------------+                                              |
|         |                                                             |
|         v                                                             |
|    +-------------------+                                              |
|    | Check for Mood    |                                              |
|    | Data Availability |                                              |
|    +-------------------+                                              |
|         |                                                             |
|         |<-----------------------+                                    |
|         v                        |                                    |
|    +--------------+   No    +--------------------+                    |
|    | Mood Data    |-------->| Display No Data    |                    |
|    | Available?   |         | Message & Prompts  |                    |
|    +--------------+         +--------------------+                    |
|         | Yes                      |                                  |
|         |                          |                                  |
|         v                          |                                  |
|    +--------------+                |                                  |
|    | Load User    |                |                                  |
|    | Preferences  |<---------------+                                  |
|    +--------------+                                                   |
|         |                                                             |
|         v                                                             |
|    +--------------+                                                   |
|    | Retrieve     |                                                   |
|    | Mood Data    |                                                   |
|    +--------------+                                                   |
|         |                                                             |
|         v                                                             |
|    +--------------------------------+                                 |
|    | Process Data in Parallel       |                                 |
|    |--------------------------------|                                 |
|    | +------------+  +------------+ |                                 |
|    | | Calculate  |  | Generate   | |                                 |
|    | | Statistics |  | Time       | |                                 |
|    | |            |  | Series     | |                                 |
|    | +------------+  +------------+ |                                 |
|    |       |              |         |                                 |
|    |       v              v         |                                 |
|    | +------------+  +------------+ |                                 |
|    | | Identify   |  | Calculate  | |                                 |
|    | | Patterns   |  | Correlations|                                 |
|    | |            |  |            | |                                 |
|    | +------------+  +------------+ |                                 |
|    +--------------------------------+                                 |
|         |                                                             |
|         v                                                             |
|    +--------------+                                                   |
|    | Generate     |                                                   |
|    | Visualizations|                                                  |
|    +--------------+                                                   |
|         |                                                             |
|         |<-----------------------+                                    |
|         v                        |                                    |
|    +--------------+              |                                    |
|    | Apply User   |              |                                    |
|    | Filters      |              |                                    |
|    +--------------+              |                                    |
|         |                        |                                    |
|         v                        |                                    |
|    +--------------+              |                                    |
|    | Render       |              |                                    |
|    | Charts       |              |                                    |
|    +--------------+              |                                    |
|         |                        |                                    |
|         v                        |                                    |
|    +--------------+     Yes      |                                    |
|    | User Changes |------------->+                                    |
|    | Filters?     |                                                   |
|    +--------------+                                                   |
|         | No                                                          |
|         v                                                             |
|    +--------------+                                                   |
|    | Generate     |                                                   |
|    | Insights     |                                                   |
|    +--------------+                                                   |
|         |                                                             |
|         v                                                             |
|    +--------------+                                                   |
|    | Display      |                                                   |
|    | Insights     |                                                   |
|    +--------------+                                                   |
|         |                                                             |
|         v                                                             |
|    +--------------+     Yes      +--------------+                     |
|    | Export Data? |------------->| Generate     |                     |
|    |              |              | Export File  |                     |
|    +--------------+              +--------------+                     |
|         | No                            |                             |
|         |<------------------------------>                             |
|         v                                                             |
|    +--------------+                                                   |
|    | End Analytics|                                                   |
|    | Session      |                                                   |
|    +--------------+                                                   |
|                                                                       |
+-----------------------------------------------------------------------+
```

This activity diagram illustrates the mood analytics process in the Pro Mood Tracker application. The process begins when a user navigates to the Analytics page. The system first checks for the availability of mood data and displays appropriate messages if no data is found. If data exists, the system loads user preferences and retrieves mood data from storage. The data processing occurs in parallel, including statistical calculations, time series generation, pattern identification, and correlation analysis. After processing, the system generates visualizations and applies user-selected filters before rendering the charts. If the user changes the filters, the process loops back to apply the new filters and render updated charts. The system then generates and displays insights based on the analyzed data. Users have the option to export the data, after which the analytics session ends. This diagram outlines the complex data flow and processing required to provide meaningful mood analytics to users. 