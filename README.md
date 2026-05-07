# Task Flow

Task Flow is a full-stack team task management app. It includes a Vite React client and an Express/MongoDB API for authentication, projects, members, task assignment, status tracking, and dashboard metrics.

## Features

- User signup and login with JWT authentication
- Admin and member roles
- Protected dashboard route
- Project creation with project admins and members
- Add and remove project members by email
- Task creation with project, assignee, priority, and due date
- Task status updates for assigned users
- Admin task deletion
- Dashboard counts for total, to-do, in-progress, done, and overdue tasks

## Tech Stack

### Client

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Server

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs

## Project Structure

```text
Task Flow/
  client/             React + Vite frontend
    src/
      components/     Shared UI and layout components
      pages/          Login, signup, and dashboard pages
      utils/          Small frontend helpers
  server/             Express API
    config/           MongoDB connection
    controllers/      Route handlers
    middleware/       Auth and role middleware
    models/           Mongoose models
    routes/           API route definitions
```

## Prerequisites

- Node.js and npm
- MongoDB, either local or hosted

## Environment Variables

Create a `server/.env` file:

```env
MONGO_URI=mongo_url_connection
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

`PORT` is optional. The server defaults to `5000`.

## Getting Started

Install and run the API:

```bash
cd server
npm install
npm run dev
```

Install and run the client in a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the client terminal, usually:

```text
http://localhost:5173
```

The frontend currently calls the API at:

```text
http://localhost:5000/api
```

## Available Scripts

### Client

```bash
npm run dev      # Start the Vite dev server
npm run build    # Build the frontend for production
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

### Server

```bash
npm run dev      # Start the API with nodemon
npm start        # Start the API with node
```

## API Overview

Base URL:

```text
http://localhost:5000/api
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Create a user account |
| POST | `/auth/login` | Login and receive a JWT |

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Get task totals and status metrics |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users` | Get users without passwords |

### Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/projects` | Get projects for the signed-in user |
| POST | `/projects` | Create a project |
| PUT | `/projects/:id/add-member` | Add a member to a project |
| PUT | `/projects/:id/remove-member` | Remove a member from a project |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | Get visible tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id/status` | Update task status |
| DELETE | `/tasks/:id` | Delete a task |

Protected routes require this header:

```text
Authorization: Bearer <token>
```

## Role Rules

- Project creators become the project admin.
- Project admins can add or remove project members.
- Project admins cannot remove themselves from their own project.
- Only the project admin can create tasks for that project.
- Tasks can only be assigned to users who are members of the selected project.
- Assigned users can update their own task status.
- Admin users can delete tasks from the dashboard.
- Admin users can view all tasks; members see only tasks assigned to them.

## Production Build

Build the client:

```bash
cd client
npm run build
```

Start the API:

```bash
cd server
npm start
```

To deploy, configure the frontend to point to the deployed API URL instead of `http://localhost:5000/api`.
