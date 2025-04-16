# Task Management API

A RESTful API for task management built with Node.js, Express, TypeScript, and SQLite.

## Features

- User authentication with JWT
- CRUD operations for tasks
- Data validation with Zod
- SQLite database for data storage
- Unit tests with Jest and Supertest

## API Endpoints

- **Authentication**

  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get a JWT token

- **Tasks**
  - `GET /api/tasks` - Get all tasks (requires authentication)
  - `POST /api/tasks` - Create a new task (requires authentication)
  - `PUT /api/tasks/:id` - Update a task (requires authentication)
  - `DELETE /api/tasks/:id` - Delete a task (requires authentication)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/task-management-api.git
   cd task-management-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   DATABASE_PATH=./database.sqlite
   ```

## Development

To start the development server:

```bash
npm run dev
```

The server will start at http://localhost:3000 (or the port specified in your `.env` file).

## Building for Production

To build the project for production:

```bash
npm run build
```

This will compile TypeScript into JavaScript in the `dist` directory.

## Running in Production

To run the compiled code:

```bash
npm start
```

## Running Tests

To run the unit tests:

```bash
npm test
```

## Project Structure

```
.
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── tests/              # Test files
│   └── index.ts            # Application entry point
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest configuration
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```
