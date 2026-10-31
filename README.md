# TableMate — School Refectory Table Management

A simple, local-first application for managing student dining lists and refectory seating. It runs in the browser and saves student and table records in that browser's local storage; it does not require a server or database.

## Features

- Register, search, update, and remove students, including gender, trade, and level/class.
- Import class rosters from CSV files with `Name`, `Gender`, `Trade`, and `Level` columns; export the student list as CSV.
- Set the number of physical refectory tables available, then add, edit, and remove tables with individual seat capacities up to that limit.
- Automatically rebalance students as rosters or tables change, distributing them as evenly as seat capacities allow; students beyond total capacity remain unassigned.
- Manually reassign students, with full tables disabled and capacity reductions blocked when a table is occupied beyond the new limit.
- Review table membership, seating totals, capacity shortages, and unassigned students.
- Print the seating plan or save it as PDF using the browser's print dialog; export assignment reports as CSV, which can be opened in Excel.
- Responsive layout for desktop and mobile screens.
- Administrator sign-in with first-run account setup and in-app credential changes.
- Change or remove the administrator profile picture from the Account page.

## Run locally

```sh
npm install
npm run dev
```

Use the app in the same browser and device to access its saved data. Clearing browser site data removes those records. CSV imports expect a header row and one student per row; names and other fields containing commas should be quoted according to standard CSV rules.

On first use, create an administrator username and password. Passwords must be at least 12 characters; the app stores a salted PBKDF2 hash and requires sign-in again after a page reload. Update credentials from **Account** in the sidebar.

Only one administrator account is supported. After it is created, later visits show sign-in for the existing credentials; creating another administrator account is rejected.

In **Tables & seating**, set the count of physical tables available before adding tables. The app prevents adding more than this count and automatically rebalances assignments after student roster and table changes, without exceeding each table's seat capacity.

The Account page also accepts JPEG, PNG, or WebP profile pictures and resizes them for local browser storage.

**Security limitation:** this local-only sign-in is an access gate for the app interface, not server-enforced authentication. Student and table records remain readable in browser storage by someone with access to the browser or device. For protection against other device users or remote attackers, deploy behind server-side authentication and authorization.

## Checks

```sh
npm test
npm run lint
npm run build
```
