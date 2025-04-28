# IVR Authentication Designer

An intuitive web application for designing and managing Interactive Voice Response (IVR) authentication flows.

## Overview

The IVR Authentication Designer allows business owners to:

1. Create authentication flows with a visual designer
2. Define and manage authentication tokens (SSN, PIN, Account Numbers, etc.)
3. Configure validation rules and branching paths
4. Design the entire customer authentication journey from start to finish

## Key Features

- **User Authentication**: Secure login and registration system
- **Project Management**: Organize authentication flows by projects
- **Token Management**: Create and configure different types of authentication tokens
- **Visual Flow Designer**: Drag-and-drop interface to design authentication flows
- **Multi-Path Support**: Create complex authentication flows with branching paths
- **Validation Configuration**: Set up validation rules for authentication tokens

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, ReactFlow
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ivr-designer.git
   cd ivr-designer
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js application 
- `/app/api` - API routes for backend functionality
- `/components` - Reusable React components
- `/components/flow` - Custom ReactFlow node components
- `/lib` - Utility functions and shared code
- `/prisma` - Prisma schema and database configuration

## Database Schema

The database is structured around the following models:

- **User**: Authentication and user information
- **Project**: Container for grouping related authentication flows
- **Token**: Authentication tokens that can be validated (SSN, PIN, etc.)
- **Flow**: Individual authentication flows
- **Node**: Steps within a flow (prompts, validation, branches, etc.)

## Future Enhancements

- Flow simulation/preview mode
- Integration with external validation services
- Export flows to various IVR platforms
- Team collaboration features
- Analytics dashboard
