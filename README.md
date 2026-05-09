# School Equipment Lending Portal

A full-stack web application for managing equipment lending in schools.

## Features
- User authentication with roles (Student, Staff, Admin)
- Equipment management (CRUD operations)
- Borrow request system with date conflict prevention
- Role-based access control
- Responsive React frontend
- RESTful API with Express.js
- SQLite database with Prisma ORM

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma, SQLite
- **Authentication**: JWT, bcryptjs

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "JWT_SECRET=your-secret-key-change-this" >> .env
echo "DATABASE_URL=\"file:./dev.db\"" >> .env

# Run Prisma migrations
npx pr