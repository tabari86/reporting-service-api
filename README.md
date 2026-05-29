# Reporting Service API

A production-oriented backend microservice for invoice analytics, reporting, PDF generation and monitoring, built with Node.js, Express, MongoDB, Redis, Docker and Swagger.






\

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

## Docker

Build image:

```bash
docker build -t reporting-service-api .
```

Run container:

```bash
docker run -p 4000:4000 reporting-service-api
```

---

## Monitoring

Health endpoint:

```text
http://localhost:4000/health
```

Metrics endpoint:

```text
http://localhost:4000/metrics
```

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

GitHub:
https://github.com/tabari86

LinkedIn : 
https://www.linkedin.com/in/moj-tabari-04a400227/




