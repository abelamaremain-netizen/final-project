# Cooperative Management System

Financial management system for Ma'ed Basic Money and Saving Credit Cooperative Society at Woldia University.

## Overview

This system manages:
- Member registration and profiles
- Savings accounts (regular and non-regular)
- Share capital and trading
- Loan applications, approvals, and disbursements
- Collateral management
- Repayment tracking
- Financial reporting
- Payroll integration

## Technology Stack

- **Backend**: Spring Boot 3.2.2 (Java 17)
- **Database**: PostgreSQL 15+
- **Authentication**: JWT with Spring Security
- **Build Tool**: Maven
- **Database Migrations**: Flyway
- **API Documentation**: OpenAPI/Swagger
- **Testing**: JUnit 5, Mockito, TestContainers

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 15+
- Docker (optional, for running PostgreSQL in container)

## Getting Started

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE cooperative_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE cooperative_db TO postgres;
```

### 2. Configuration

Update `src/main/resources/application.yml` with your database credentials if different from defaults.

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 5. Access API Documentation

Once the application is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## Project Structure

```
src/main/java/et/edu/woldia/coop/
├── config/          # Configuration classes
├── controller/      # REST API controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── exception/       # Custom exceptions and handlers
├── mapper/          # MapStruct mappers
├── repository/      # Spring Data JPA repositories
├── security/        # Security components (JWT, filters)
├── service/         # Business logic services
└── util/            # Utility classes

src/main/resources/
├── db/migration/    # Flyway migration scripts
├── application.yml  # Application configuration
└── logback-spring.xml  # Logging configuration
```

## Database Migrations

Database schema is managed using Flyway. Migration scripts are located in `src/main/resources/db/migration/`.

Migrations run automatically on application startup.

## Running Tests

```bash
mvn test
```

## Building for Production

```bash
mvn clean package -Pprod
```

The JAR file will be created in the `target/` directory.

## Environment Variables

For production deployment, set the following environment variables:

- `DATABASE_URL`: PostgreSQL connection URL
- `DATABASE_USERNAME`: Database username
- `DATABASE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation (minimum 256 bits)

## Default Configuration

The system comes with default configuration values:
- Registration fee: 500 ETB
- Share price: 150 ETB per share
- Minimum shares: 3
- Savings interest rate: 7% annual
- Loan interest rate: 13-19%
- Maximum loan: 500,000 ETB

These can be modified through the configuration management API.

## Default Roles

The system includes the following roles:
- **ADMINISTRATOR**: Full system access
- **LOAN_OFFICER**: Loan management
- **FINANCE_STAFF**: Financial operations
- **MEMBER_SERVICES**: Member management
- **AUDITOR**: Read-only access

## API Endpoints

API documentation is available through Swagger UI. Key endpoint groups:

- `/api/auth` - Authentication
- `/api/members` - Member management
- `/api/accounts` - Account operations
- `/api/loans` - Loan management
- `/api/collateral` - Collateral management
- `/api/reports` - Financial reporting
- `/api/configurations` - System configuration

## Security

- All endpoints (except authentication) require JWT token
- Role-based access control (RBAC) with grant/revoke model
- Password encryption using BCrypt
- Audit logging for all operations

## Logging

Logs are written to:
- Console (development)
- `logs/cooperative-management-system.log` (all logs)
- `logs/error.log` (errors only)

Log files rotate daily and are kept for 30 days.

## Support

For issues or questions, contact the development team.

## License

Proprietary - Ma'ed Basic Money and Saving Credit Cooperative Society
