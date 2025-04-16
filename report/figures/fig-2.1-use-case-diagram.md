# Figure 2.1: Use Case Diagram for Authentication and User Management

```
+----------------------------------------------------------------------+
|                                                                      |
|                 Authentication and User Management                   |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|    +-----------+                                                     |
|    |           |                                                     |
|    |   Guest   |                                                     |
|    |   User    |                                                     |
|    |           |                                                     |
|    +-----------+                                                     |
|         |                                                            |
|         | (1) Register                                               |
|         v                                                            |
|    +-----------+                                                     |
|    |  Create   |                                                     |
|    |  Account  |                                                     |
|    +-----------+                                                     |
|         |                                                            |
|         | (2) Submit User Info                                       |
|         v                                                            |
|    +-----------+                                                     |
|    |           |                                                     |
|    | Validate  |<-----+                                              |
|    |  Inputs   |      |                                              |
|    |           |      |                                              |
|    +-----------+      | Validation Failed                            |
|         |             |                                              |
|         | Validation  |                                              |
|         | Successful  |                                              |
|         v             |                                              |
|    +-----------+      |                                              |
|    |           |      |                                              |
|    |  Create   |------+                                              |
|    |   User    |                                                     |
|    |           |                                                     |
|    +-----------+                                                     |
|         |                                                            |
|         | (3) Account Created                                        |
|         v                                                            |
|    +-----------+                                                     |
|    |           |                                                     |
|    | Registered|                                                     |
|    |   User    |                                                     |
|    |           |                                                     |
|    +-----------+                                                     |
|         |                                                            |
|         |<------------------------------------------------+          |
|         |                                                 |          |
|         | (4) Login                                       |          |
|         v                                                 |          |
|    +-----------+                                          |          |
|    |           |                                          |          |
|    |  Verify   |                                          |          |
|    | Credentials|                                         |          |
|    |           |                                          |          |
|    +-----------+                                          |          |
|         |                                                 |          |
|         | (5) Authentication Successful                   |          |
|         v                                                 |          |
|    +-----------+                                          |          |
|    |           |         +-----------+                    |          |
|    |           |-------->|  Manage   |                    |          |
|    | Logged In |         |  Profile  |                    |          |
|    |   User    |         +-----------+                    |          |
|    |           |              |                           |          |
|    +-----------+              | Update                    |          |
|         |                     | Settings                  |          |
|         |                     v                           |          |
|         |                +-----------+                    |          |
|         |                |  Save     |                    |          |
|         |                |  Changes  |--------------------+          |
|         |                +-----------+                               |
|         |                                                            |
|         | (6) Logout                                                 |
|         v                                                            |
|    +-----------+                                                     |
|    |  End      |                                                     |
|    |  Session  |                                                     |
|    +-----------+                                                     |
|                                                                      |
+----------------------------------------------------------------------+
```

This Use Case Diagram illustrates the authentication and user management flow in the Pro Mood Tracker application. The process begins with a Guest User who can register to create an account. Upon successful validation of inputs, a user account is created, transforming the Guest into a Registered User. The Registered User can then log in by providing credentials that are verified by the system. Once authenticated, the Logged In User can manage their profile and update settings, with changes being saved to the system. The user can also log out, ending their session and returning to the Guest User state. This diagram represents the core user management functionality required for the application, highlighting the sequential flow and state transitions in the authentication process. 