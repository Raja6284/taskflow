# TaskFlow - Technical Documentation

## Overview

TaskFlow is a modern Todo list application with recurring tasks support, built with Next.js, Express.js, PostgreSQL, and Zustand. This document provides technical details about the implementation, architecture, and design decisions.

## Architecture

The application follows a full-stack architecture:

### Frontend
- **Next.js**: React framework with App Router for server and client components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library built on Radix UI
- **Zustand**: State management library with persistence

### Backend
- **Express.js**: Node.js web application framework for the API
- **PostgreSQL**: Relational database for data storage
- **Vercel Postgres**: Serverless PostgreSQL database

### Data Flow
1. User interacts with the UI
2. Client-side state is updated via Zustand
3. API requests are made to the Express.js backend
4. Backend performs CRUD operations on the PostgreSQL database
5. Response is sent back to the client
6. UI is updated with the new data

## Database Schema

\`\`\`sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE,
  recurrence JSONB
);

CREATE INDEX idx_tasks_completed ON tasks (completed);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);
\`\`\`

The `recurrence` field uses JSONB to store the recurrence pattern with the following structure:

\`\`\`typescript
interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number;
  unit?: "day" | "week" | "month" | "year";
  daysOfWeek?: number[]; // 0-6, Sunday to Saturday
  dayOfMonth?: number; // 1-31
  monthOfYear?: number; // 1-12
  endDate?: Date;
}
\`\`\`

## Component Structure

### Core Components
- **TaskDashboard**: Main container component
- **TaskHeader**: Header with title, task count, and theme toggle
- **TaskInput**: Form for adding new tasks
- **TaskList**: Container for task items
- **TaskItem**: Individual task with actions
- **RecurrenceDialog**: Modal for setting recurrence patterns
- **TaskSync**: Handles synchronization between local state and API

### State Management
The application uses Zustand for state management with the following store structure:

\`\`\`typescript
interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  generateRecurringInstances: () => void;
  setTasks: (tasks: Task[]) => void;
}
\`\`\`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | Get all tasks |
| `/api/tasks` | POST | Create a new task |
| `/api/tasks/:id` | GET | Get a specific task |
| `/api/tasks/:id` | PATCH | Update a task |
| `/api/tasks/:id` | DELETE | Delete a task |
| `/api/setup` | GET | Initialize database |

## Recurrence Implementation

The recurrence system works as follows:

1. When a task is created, it can have a recurrence pattern
2. When a task with a recurrence pattern is completed, the `generateRecurringInstances` function is called
3. This function calculates the next occurrence date based on the pattern
4. A new task instance is created with the same title and recurrence pattern, but with the new due date
5. The original task remains completed

The calculation of the next occurrence date depends on the frequency:
- **Daily**: Add the interval number of days
- **Weekly**: Find the next matching day of the week
- **Monthly**: Add the interval number of months and set the day
- **Yearly**: Add the interval number of years and set the month and day
- **Custom**: Add the interval number of the specified unit (days, weeks, months, years)

## Hydration and Client-Side Rendering

The application uses a combination of server-side rendering and client-side hydration. To prevent hydration errors:

1. Components use the `useEffect` hook to detect when they are mounted on the client
2. Initial state is rendered with placeholder values until client-side JavaScript takes over
3. Task counts and other dynamic data are only displayed after hydration is complete
4. Loading states are used to prevent UI flashes during hydration

## Performance Optimizations

Several optimizations have been implemented to ensure the application runs smoothly:

1. **API Call Throttling**: Prevents rapid successive API calls that could overload the server
2. **Initialization Guards**: Ensures setup functions are only called once
3. **Efficient State Updates**: Batch updates to minimize re-renders
4. **Debounced User Interactions**: Prevents multiple submissions when users interact with forms
5. **Optimistic UI Updates**: Updates the UI immediately before API calls complete

## Error Handling

The application implements comprehensive error handling:

1. **API Errors**: All API calls are wrapped in try/catch blocks
2. **Database Errors**: Proper error handling for database operations
3. **UI Error States**: Clear error messages displayed to users
4. **Fallback Content**: Graceful degradation when components fail

## Security Considerations

- Input validation using Zod
- Parameterized SQL queries to prevent SQL injection
- CORS configuration for API security
- Environment variables for sensitive information

## Future Improvements

- Add user authentication
- Implement task categories/tags
- Add task priorities
- Implement drag-and-drop reordering
- Add notifications for upcoming tasks
- Implement task sharing functionality

## Deployment Considerations

When deploying to production:

1. Ensure database migrations are handled properly
2. Set up proper CORS headers for production domains
3. Configure environment variables in the production environment
4. Set up monitoring and logging
5. Implement rate limiting for API endpoints

## Conclusion

TaskFlow demonstrates a modern, full-stack application architecture with React, Next.js, Express, and PostgreSQL. The application showcases best practices in state management, API design, and user interface development.
