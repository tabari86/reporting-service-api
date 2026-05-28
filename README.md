# Reporting Service API

A backend microservice for invoice analytics and reporting, built with Node.js, Express, MongoDB, Redis and Docker.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-API-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Caching-red?logo=redis)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Supertest-orange?logo=jest)

## About the Project

Reporting Service API is an independent microservice for analyzing invoice data.

The service reads invoice records from MongoDB, calculates revenue and status statistics, provides reporting endpoints, supports Redis caching, and can generate daily PDF reports.

It is designed as a practical backend service that can be integrated into larger systems, for example together with separate invoice or user services.

## Key Features

| Feature           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| Invoice Analytics | Summary reports for invoices, revenue and payment status |
| Revenue per Day   | Groups invoice revenue by date                           |
| Daily Reports     | Cron job creates daily report snapshots                  |
| PDF Export        | Generates daily PDF reports on demand                    |
| API-Key Security  | Protects reporting endpoints via `x-api-key`             |
| JWT Role Access   | Supports role-based access for report users/admins       |
| Redis Caching     | Caches report results and reduces database load          |
| Health Check      | Provides service status via `/health`                    |
| Metrics Endpoint  | Provides runtime metrics via `/metrics`                  |
| Docker Support    | Runs in a containerized environment                      |
| Automated Tests   | Jest and Supertest test coverage                         |

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis
* Docker
* Jest
* Supertest
* PDFKit
* node-cron
* Swagger / OpenAPI

## API Endpoints

| Method | Endpoint                    | Description                                             |
| ------ | --------------------------- | ------------------------------------------------------- |
| GET    | `/reports/summary`          | Returns total invoices, total revenue and status counts |
| GET    | `/reports/revenue-per-day`  | Returns revenue grouped by day                          |
| GET    | `/reports/daily-report.pdf` | Generates and downloads a PDF report                    |
| GET    | `/health`                   | Health check endpoint                                   |
| GET    | `/metrics`                  | Basic runtime metrics                                   |

All `/reports/*` endpoints require an API key in the request header:

```http
x-api-key: your_api_key_here
```

## Example Request

```bash
curl -H "x-api-key: your_api_key_here" http://localhost:4000/reports/summary
```

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
├── swagger.js
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## Environment Variables

Create a `.env` file based on `.env.example`.

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/reporting_service
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=60
```

## Installation

```bash
git clone https://github.com/tabari86/reporting-service-api.git
cd reporting-service-api
npm install
```

## Run the Project

```bash
npm run dev
```

or:

```bash
npm start
```

## Run Tests

```bash
npm test
```

## Docker

Build the Docker image:

```bash
docker build -t reporting-service-api:latest .
```

Run the container:

```bash
docker run -p 4000:4000 reporting-service-api:latest
```

## Security Notes

Sensitive environment files such as `.env` and `.env.test` are ignored by Git.

Only `.env.example` is included in the repository as a safe template.

## Author

Moj Tabari
GitHub: https://github.com/tabari86

















