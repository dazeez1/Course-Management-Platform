# Course Management Platform

A comprehensive backend system for academic institutions to manage course allocations, track facilitator activities, and support student reflections with internationalization features.

## 🎯 Project Overview

This platform consists of three main modules:

1. **Course Allocation System** - Manage facilitator assignments to courses
2. **Facilitator Activity Tracker (FAT)** - Weekly activity logging with Redis notifications
3. **Student Reflection Page** - Multilingual frontend with i18n/l10n support

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Queue System**: Redis for notifications
- **Testing**: Jest
- **Documentation**: Swagger

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- Git

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Course-Management-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your database and Redis credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MySQL and Redis containers
docker run --name mysql-course-platform -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=course_management_db -p 3306:3306 -d mysql:8.0

docker run --name redis-course-platform -p 6379:6379 -d redis:6.0
```

#### Option B: Local Installation

- Install MySQL and create database: `course_management_db`
- Install Redis and start the service

### 5. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Health Check

```
GET /health
```

### Authentication Endpoints

```
POST /api/v1/auth/login
POST /api/v1/auth/register
```

### Course Management

```
GET    /api/v1/courses
POST   /api/v1/courses
GET    /api/v1/courses/:id
PUT    /api/v1/courses/:id
DELETE /api/v1/courses/:id
```

### Course Allocations

```
GET    /api/v1/courses/allocations
POST   /api/v1/courses/allocations
GET    /api/v1/courses/allocations/:id
PUT    /api/v1/courses/allocations/:id
DELETE /api/v1/courses/allocations/:id
```

### Activity Tracking

```
GET    /api/v1/activities
POST   /api/v1/activities
GET    /api/v1/activities/:id
PUT    /api/v1/activities/:id
DELETE /api/v1/activities/:id
```

## 👥 User Roles

- **Manager**: Can assign courses to facilitators and view all activities
- **Facilitator**: Can view assigned courses and submit activity logs
- **Student**: Can access reflection page (frontend only)

## 🔐 Default Credentials

After setup, you can login with:

**Manager Account:**

- Email: `admin@institution.com`
- Password: `admin123`

**Facilitator Accounts:**

- Email: `john.smith@institution.com`
- Password: `facilitator123`
- Email: `sarah.johnson@institution.com`
- Password: `facilitator123`

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── config/           # Database and Redis configuration
├── models/           # Sequelize models
├── middleware/       # Authentication and error handling
├── routes/           # API route handlers
├── services/         # Business logic
├── utils/            # Helper functions
└── server.js         # Main application file
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (drop, create, migrate, seed)

## 📝 Database Schema

### Core Tables

- `users` - User accounts and authentication
- `courses` - Course information
- `cohorts` - Student cohort groups
- `course_allocations` - Course assignments to facilitators
- `activity_trackers` - Weekly activity logs

### Key Relationships

- Users can be assigned as facilitators to multiple courses
- Each course allocation is linked to a specific cohort and trimester
- Activity logs are tied to specific course allocations and weeks

## 🌐 Internationalization

The student reflection page supports multiple languages:

- English (default)
- French
- Additional languages can be easily added

## 🔔 Notification System

The platform uses Redis to handle:

- Weekly reminder notifications to facilitators
- Alert notifications to managers for missed deadlines
- Background processing of notification queues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Note**: This is an academic project. All submitted work must be original and reflect the student's own understanding and effort.
