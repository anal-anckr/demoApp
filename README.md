# Task Manager Application

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation Steps

1. **Install frontend dependencies**
   ```
   npm install
   ```

2. **Install backend dependencies**
   ```
   cd backend
   npm install
   ```

3. **Return to the root directory**
   ```
   cd ..
   ```

### Running the Application


1. **In a new terminal, start the frontend application & Start the backend server**
   ```
   npm start
   ```
   The API will be available at http://localhost:3000/api

   The application will be available at http://localhost:4200

### Building for Production

1. **Build the backend**
   ```
   cd backend
   npm run build
   ```

2. **Build the frontend**
   ```
   cd ..
   npm run build
   ```

## Environment Configuration
- Backend configuration can be modified in the `.env` file
- Frontend API URLs can be configured in the environment files