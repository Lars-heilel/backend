# Realtime Chat Application

A real-time chat application built with NestJS following SOLID principles, featuring authentication, friend management, and messaging.

## Features
- User authentication (register/login with JWT)
- Email confirmation and password reset
- Friend request management
- Real-time messaging with WebSockets
- Caching with Redis
- Prisma ORM for database operations
- Nodemailer for email services

## Technologies
- **Backend**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis
- **Email**: Nodemailer
- **Containerization**: Docker
- **Validation**: Zod
- **Documentation**: Swagger

## Prerequisites
- Docker and Docker Compose
- Node.js (v18+)
- SMTP provider credentials (Google, Yandex, etc.)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Lars-heilel/backend.git
cd backend 
```
### 2. Configure environment
Create .env file based on .env.example:
### 3. Install dependencies
```bash
npm install
```
### 4. Nodemailer Configuration
Set up your SMTP provider:

Use smpt providers (google/yandex)... 

Configure SMTP settings in .env:
```text
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_EMAIL=youremail@gmail.com
NODEMAILER_PASSWORD=your-app-password
```
### 5. launching an application for development
For Dev 
```bash
 npm run docker:up:dev 
```
migrate
```bash
 npm run prisma:deploy
```

```bash
 npm run start:dev
 ```

### 5. launching an application for production
For Prod 
```bash 
npm run docker:prod
```



The application adheres to SOLID principles, which allows for easy replacement of any library, be it an ORM or something else.

 
