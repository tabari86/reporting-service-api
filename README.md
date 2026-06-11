# Reporting Service API

![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-API-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Jest](https://img.shields.io/badge/Tests-Passing-success?logo=jest)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-brightgreen)

A production-oriented backend microservice for invoice analytics, reporting, PDF generation and monitoring, built with Node.js, Express, MongoDB, Redis, Docker and Swagger.

---

## About the Project

Reporting Service API is a standalone microservice responsible for invoice analytics and reporting.

The service aggregates invoice data stored in MongoDB, provides reporting endpoints, generates PDF reports, exposes monitoring endpoints, supports optional Redis caching and includes Swagger/OpenAPI documentation.

The project demonstrates common backend concepts such as:

* REST API design
* API-Key authentication
* JWT authentication
* Role-based authorization
* MongoDB aggregation
* PDF generation
* Health monitoring
* Automated testing
* Docker deployment

---

## Swagger Documentation

Swagger UI is available after starting the application:

```text
http://localhost:4000/api-docs
```

The documentation includes:

* Available endpoints
* Request descriptions
* Response information
* API-Key authentication
* JWT authentication

### Swagger Preview

Interactive API documentation with API-Key and JWT authentication support.

![Swagger UI](docs/swagger-ui.png)

---

## Features

| Feature            | Description                    |
| ------------------ | ------------------------------ |
| Invoice Analytics  | Revenue and invoice statistics |
| Revenue Reports    | Revenue grouped by day         |
| PDF Export         | Daily report generation as PDF |
| API-Key Security   | Header-based API protection    |
| JWT Authentication | Bearer token validation        |
| Role Authorization | Role-based access control      |
| Health Endpoint    | Service monitoring             |
| Metrics Endpoint   | Runtime statistics             |
| Redis Cache        | Optional response caching      |
| Docker Support     | Container deployment           |
| Swagger/OpenAPI    | Interactive API documentation  |
| Automated Tests    | Jest + Supertest               |

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis
* Docker
* Swagger / OpenAPI
* JWT
* Jest
* Supertest
* PDFKit
* node-cron

---

## API Endpoints

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/reports/summary`          | Invoice summary statistics |
| GET    | `/reports/revenue-per-day`  | Revenue grouped by day     |
| GET    | `/reports/daily-report.pdf` | Generate PDF report        |
| GET    | `/health`                   | Service health check       |
| GET    | `/ready`                    | Dependency readiness check |
| GET    | `/metrics`                  | Runtime metrics            |

---

## Authentication

Protected reporting endpoints require:

### API Key

```http
x-api-key: your_api_key_here
```

### JWT

```http
Authorization: Bearer <jwt-token>
```

Swagger supports both authentication methods through the **Authorize** button.

---

## Project Structure

```text
reporting-service-api/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── swagger/
├── tests/
├── utils/
├── index.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/workflows/ci.yml
├── package.json
├── .env.example
└── README.md
```

---

## Environment Variables

Create a local `.env` file based on `.env.example`.

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/reporting_service
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

# Optional
REDIS_URL=
```

If Redis is not installed locally, leave `REDIS_URL` empty.

---

## Installation

```bash
git clone https://github.com/tabari86/reporting-service-api.git
cd reporting-service-api
npm install
```

---

## Start Application

```bash
npm start
```

---

## Run Tests

```bash
npm test
```

All current Jest test suites pass successfully.

---

## Continuous Integration

This project uses GitHub Actions as a basic CI quality gate.

The CI workflow runs automatically on pushes and pull requests to the `main` branch.

The workflow performs the following checks:

* installs dependencies with `npm ci`
* starts a MongoDB service for integration tests
* runs the automated Jest test suite
* validates that the Docker image can be built successfully

Redis is not required during CI test execution because caching is disabled in the test environment.

The workflow file is located at:

```text
.github/workflows/ci.yml
```

---

## Docker

The application can be run either as a standalone Docker container or as a complete local development stack with Docker Compose.

### Build Docker Image

```bash
docker build -t reporting-service-api .
```

### Run Container Manually

```bash
docker run -p 4000:4000 reporting-service-api
```

For manual container runs, MongoDB and optional Redis must already be available and configured through environment variables.

### Run with Docker Compose

Docker Compose starts the API together with MongoDB and Redis:

```bash
docker compose up --build
```

The local Compose setup includes:

* API service on port `4000`
* MongoDB on port `27017`
* Redis on port `6379`
* MongoDB volume for persistent local data
* Health checks for MongoDB and Redis before starting the API

After startup, the service is available at:

```text
http://localhost:4000
```

Swagger UI is available at:

```text
http://localhost:4000/api-docs
```

To stop the local stack:

```bash
docker compose down
```

To stop the stack and remove the MongoDB volume:

```bash
docker compose down -v
```


---

## Monitoring

Health endpoint:

```text
http://localhost:4000/health
```

Readiness endpoint:

```text
http://localhost:4000/ready
```

Metrics endpoint:

```text
http://localhost:4000/metrics
```

`/health` checks whether the API process is running.

`/ready` checks whether the service is ready to handle requests by reporting the status of required and optional dependencies.

MongoDB is treated as a required dependency. Redis is optional and does not make the service unavailable when it is not configured.


---

## Security Notes

The following files are ignored by Git:

```text
.env
.env.test
```

Only `.env.example` is committed to the repository.

---

## Author

Moj Tabari

Website : 
https://mtintelligence.ai


LinkedIn : 
https://www.linkedin.com/in/moj-tabari-04a400227/




