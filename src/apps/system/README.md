# README

## Application Creation Rules

User applications must not be created inside the `/system` folder,
because it is reserved exclusively for system applications
and components required for the operating system.

All user applications should be created inside the following folder:

/users

Example:

/users/my_application

The `/system` folder should contain only:

- system applications,
- system libraries,
- files required by the operating system.

Violating this rule may lead to:

- system conflicts,
- update issues,
- permission errors,
- system instability.
