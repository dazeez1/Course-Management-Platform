# Course Management Platform

A comprehensive multi-feature backend system for academic institutions to support faculty operations, monitor student progress, and enhance academic coordination.

## Project Overview

This platform consists of three main modules:

### Module 1: Course Allocation System

- **Purpose**: Manage facilitator assignments to courses
- **Features**: CRUD operations, filtering, role-based access control
- **Actors**: Academic Managers (create/update), Facilitators (view only)

### Module 2: Facilitator Activity Tracker (FAT)

- **Purpose**: Track weekly facilitator activities and compliance
- **Features**: Activity logs, Redis notifications, background workers
- **Actors**: Facilitators (manage own logs), Managers (monitor all)

### Module 3: Course Reflection Page with i18n/l10n

- **Purpose**: Multilingual course feedback collection
- **Features**: Dynamic language switching, responsive design
- **Location**: `student-reflection-page/` directory
- **Hosting**: Designed for GitHub Pages deployment
- **Live Demo**: [https://course-management-platform-dusky.vercel.app/](https://course-management-platform-dusky.vercel.app/)
- **Demo Video**: [Video Postman](https://drive.google.com/drive/folders/1Ycxr9_mB1dTd2i3-ti7cmQJVtF98dmVn?usp=sharing)

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt password hashing
- **Caching/Queuing**: Redis for notifications
- **Frontend**: HTML/CSS/JavaScript (Module 3)
- **Testing**: Jest for unit testing
- **Documentation**: Swagger API documentation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dazeez1/Course-Management-Platform.git
cd Course-Management-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

### 4. Database Setup

```bash
# Start MySQL and Redis services
npm run db:reset  # Creates database and sample data
```

### 5. Start the Server

```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile

### Course Allocation Endpoints

- `POST /api/v1/allocations` - Create course allocation
- `GET /api/v1/allocations` - List allocations with filtering
- `GET /api/v1/allocations/:id` - Get specific allocation
- `PUT /api/v1/allocations/:id` - Update allocation
- `DELETE /api/v1/allocations/:id` - Delete allocation

### Activity Tracker Endpoints

- `POST /api/v1/activity/logs` - Create activity log
- `GET /api/v1/activity/logs` - List activity logs
- `GET /api/v1/activity/logs/:id` - Get specific log
- `PUT /api/v1/activity/logs/:id` - Update activity log
- `DELETE /api/v1/activity/logs/:id` - Delete activity log
- `GET /api/v1/activity/stats` - Get activity statistics

## User Roles & Access Control

### Manager

- Full CRUD access to course allocations
- Read access to all activity logs
- User management capabilities

### Facilitator

- Read-only access to assigned courses
- Full CRUD access to own activity logs
- Profile management

### Student

- Basic profile access
- Reflection page access

## Module 3: Student Reflection Page

### Features

- **Dual Language Support**: English, French and Yoruba
- **Dynamic Language Switching**: Seamless transitions
- **Responsive Design**: Works on all devices
- **Modern UI**: Beautiful gradients and animations

### Setup for GitHub Pages

1. Navigate to `student-reflection-page/` directory
2. Create a new GitHub repository
3. Upload `index.html` to the repository
4. Enable GitHub Pages in repository settings
5. Access at `https://yourusername.github.io/repository-name`

### Testing

```bash
# Open the reflection page locally
open student-reflection-page/index.html
# or
open student-reflection-page/test.html  # For testing
```

## Testing

### Unit Tests

```bash
npm test
```

### API Testing

```bash
# Use Postman or curl to test endpoints
curl -X GET http://localhost:5001/api/v1/health
```

## Database Schema

### Core Tables

- `users` - User accounts and roles
- `courses` - Course information
- `cohorts` - Student cohort groups
- `course_allocations` - Facilitator assignments
- `activity_trackers` - Weekly activity logs

### Relationships

- Course allocations link facilitators to courses and cohorts
- Activity logs are tied to specific allocations
- All relationships maintain referential integrity

## Notification System

### Redis Integration

- Background workers process notification queues
- Facilitator reminders for missing logs
- Manager alerts for activity submissions
- Scalable message queuing system

## Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run unit tests
npm run db:reset   # Reset database and seed data
npm run db:migrate # Run database migrations
npm run db:seed    # Database seeding (not used - uses databaseSetup.js)
```

## Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=5001
NODE_ENV=development
```

## Project Structure

```
Course-Management-Platform/
├── src/
│   ├── config/           # Database and Redis configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Authentication and validation
│   ├── models/          # Sequelize models
│   ├── routes/          # API endpoints
│   ├── workers/         # Background notification workers
│   └── server.js        # Main application file
├── student-reflection-page/  # Module 3: i18n/l10n page
│   ├── index.html       # Main reflection page
│   ├── test.html        # Testing page
│   └── README.md        # Module documentation
├── migrations/          # Database migrations
├── tests/              # Unit tests
└── README.md           # This file
```

## Academic Integrity

This project demonstrates:

- **Backend Development**: Node.js, Express, MySQL, Redis
- **Database Design**: Normalized schema with relationships
- **Authentication**: JWT-based security
- **Internationalization**: i18n/l10n implementation
- **Testing**: Unit test coverage
- **Documentation**: Comprehensive API documentation

## Support

For questions or issues:

1. Check the documentation in each module
2. Review the API endpoints
3. Test with the provided sample data
4. Check console logs for debugging information

## 📄 License

This project is created for educational purposes as part of the Course Management Platform assignment.

---

**Note**: All modules are fully functional and ready for demonstration. The student reflection page is designed for GitHub Pages hosting and demonstrates practical i18n/l10n implementation.
