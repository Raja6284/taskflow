# TaskFlow - Modern Todo App with Recurring Tasks

A professional Todo list application with recurring tasks support, built with Next.js, Express.js, PostgreSQL, and Zustand.

## Features

- Clean black-and-white UI with light/dark mode support
- Task management with CRUD operations
- Recurring tasks with various frequency options:
  - Daily
  - Weekly (with day selection)
  - Monthly
  - Yearly
  - Custom intervals
- Due date selection with calendar
- Task filtering (show/hide completed)
- Responsive design

## Tech Stack

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Express.js API
- **Database**: PostgreSQL (via Vercel Postgres)
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Testing**: Jest and React Testing Library

## Project Structure

\`\`\`
├── app/                  # Next.js App Router
│   ├── api/              # API routes and Express server
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── task-dashboard.tsx
│   ├── task-header.tsx
│   ├── task-input.tsx
│   ├── task-item.tsx
│   ├── task-list.tsx
│   ├── recurrence-dialog.tsx
│   └── task-sync.tsx
├── lib/                  # Utility functions and state
│   ├── api.ts            # API client
│   ├── store.ts          # Zustand store
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── __tests__/            # Test files
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Set up environment variables:
   \`\`\`
   POSTGRES_URL=your_postgres_connection_string
   PORT=3001
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   \`\`\`
4. Run the database initialization script:
   \`\`\`bash
   npm run init-db
   \`\`\`
5. Start the Express server:
   \`\`\`bash
   npm run server
   \`\`\`
6. In a separate terminal, run the Next.js development server:
   \`\`\`bash
   npm run dev
   \`\`\`

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
\`\`\`

## Recurrence System

The application supports various recurrence patterns:

- **Daily**: Tasks repeat every day or every X days
- **Weekly**: Tasks repeat on specific days of the week
- **Monthly**: Tasks repeat on a specific day of the month
- **Yearly**: Tasks repeat on a specific day of a specific month
- **Custom**: Tasks repeat based on a custom interval (days, weeks, months, years)

When a recurring task is completed, a new instance is automatically generated based on the recurrence pattern.

## Testing

Run the test suite with:

\`\`\`bash
npm test
\`\`\`

## Deployment

The application can be deployed to Vercel with the following configuration:

1. Connect your GitHub repository to Vercel
2. Add the PostgreSQL connection string as an environment variable
3. Deploy the application

## Troubleshooting

If you encounter issues:

1. Make sure your PostgreSQL database is running and accessible
2. Check that environment variables are correctly set
3. Ensure the Express server is running alongside the Next.js app
4. Clear browser cache and local storage if you encounter UI issues
5. Check the browser console and server logs for error messages

## License


