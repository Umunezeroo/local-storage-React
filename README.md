# TableMate — School Refectory Table Management

A simple, local-first application for managing student dining lists and refectory seating. It runs in the browser and saves student and table records in that browser's local storage; it does not require an account, server, or database.

## Features

- Register, search, update, and remove students, including gender, trade, and level/class.
- Import class rosters from CSV files with `Name`, `Gender`, `Trade`, and `Level` columns; export the student list as CSV.
- Add, edit, and remove dining tables with a configurable capacity for each table.
- Automatically assign students across available seats while distributing gender, trade, and level groups; students beyond total capacity remain unassigned.
- Manually reassign students, with full tables disabled and capacity reductions blocked when a table is occupied beyond the new limit.
- Review table membership, seating totals, capacity shortages, and unassigned students.
- Print the seating plan or save it as PDF using the browser's print dialog; export assignment reports as CSV, which can be opened in Excel.
- Responsive layout for desktop and mobile screens.

## Run locally

```sh
npm install
npm run dev
```

Use the app in the same browser and device to access its saved data. Clearing browser site data removes those records. CSV imports expect a header row and one student per row; names and other fields containing commas should be quoted according to standard CSV rules.

## Checks

```sh
npm test
npm run lint
npm run build
```
