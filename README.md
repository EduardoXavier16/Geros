# GEROS API

A robust REST API built with NestJS for managing work orders and user authentication.

## Features

- User Authentication with JWT
- Work Order Management
- MySQL Database Integration
- Secure Environment Configuration
- TypeORM Integration

## Prerequisites

- Node.js (v14 or higher)
- MySQL Database
- npm (Node Package Manager)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MYSQL_URL=your_mysql_connection_url
MYSQL_DATABASE=your_database_name
MYSQL_USER=your_database_user
MYSQL_PASSWORD=your_database_password
MYSQL_HOST=your_database_host
MYSQL_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=8h
```

## Installation

```bash
$ npm install
```

## Running the Application

```bash
# Development mode
$ npm run start

# Watch mode (recommended for development)
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Database Configuration

The application uses TypeORM with MySQL. Database configuration is handled through environment variables and is set up in `app.module.ts`:

- Database Type: MySQL
- SSL Configuration: Enabled with `rejectUnauthorized: false`
- Entity Synchronization: Disabled by default
- Logging: Enabled

## Authentication

The API uses JWT (JSON Web Token) for authentication:

- Token Expiration: 8 hours
- Secure token storage
- Protected routes using JWT Guards

## API Endpoints

### Authentication

- POST `/auth/login` - User login
- POST `/auth/register` - User registration

### Work Orders

- GET `/work-orders` - List all work orders
- POST `/work-orders` - Create new work order
- GET `/work-orders/:id` - Get specific work order
- PATCH `/work-orders/:id` - Update work order
- DELETE `/work-orders/:id` - Delete work order

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Security

- Environment variables for sensitive data
- SSL enabled for database connections
- JWT-based authentication
- Protected API endpoints

## Support

For support and questions, please refer to:

- [NestJS Documentation](https://docs.nestjs.com)
- [Discord Community](https://discord.gg/G7Qnnhy)
- [Official Courses](https://courses.nestjs.com/)

## License

This project is licensed under the MIT License.
