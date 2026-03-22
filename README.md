# FuelEU Maritime Compliance Platform

A minimal yet structured implementation of a Fuel EU Maritime compliance module. Built with React + TypeScript + TailwindCSS for the frontend, and Node.js + TypeScript + PostgreSQL for the backend.

## Architecture

This project strictly adheres to **Hexagonal Architecture** (Ports and Adapters).
- **Core (Domain & Application)**: Contains business entities, application use-cases, and repository interfaces (Ports). Absolutely zero dependencies on frameworks (Express, React) or databases (Postgres).
- **Adapters (Inbound/Outbound)**: Contains HTTP routers (`Express`), Database Repositories (`pg`), API Clients (`Axios`), and UI Components (`React`).

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Database Setup
1. Ensure PostgreSQL is running locally (`localhost:5432`).
2. Update the `.env` file in the `backend/` directory if your credentials differ:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=fueleu
   DB_PASSWORD=postgres
   DB_PORT=5432
   ```

### Backend
1. Navigate to `/backend`.
2. Run `npm install`
3. Run `npm run seed` to create schemas and seed the database.
4. Run `npm run dev` to start the Node server on port 3000.

### Frontend
1. Navigate to `/frontend`.
2. Run `npm install`
3. Run `npm run dev` to start the Vite React server.

## Testing
- **Backend Tests:** Run `npm run test` inside the `/backend` directory. Tests are built using Jest and cover unit logic (e.g. `ComputeCB`, `BankSurplus` calculations).
