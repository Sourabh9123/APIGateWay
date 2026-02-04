# High-Performance API Gateway

A modular, production-ready API Gateway built with **Bun**, **Nginx**, and **Redis**. It handles versioned routing, JWT authentication, and dual-level rate limiting, proxying requests to downstream microservices via **gRPC**.

## Features

- **High Performance**: Built on [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.
- **Load Balancing**: Nginx configured as a reverse proxy and load balancer.
- **Redis Stack**: Enhanced with Redis-backed sliding window rate limiter and **Redis Insight**.
    - **Authenticated**: Higher limits for logged-in users (ID-based).
    - **Anonymous**: Stricter limits for guests (IP-based).
    - **Visualization**: Built-in **Redis Insight** for monitoring.
- **Centralized Logging**: Daily rotating JSON logs via **Winston** collected by **Fluent Bit**.
- **gRPC Clients**: Uses `@connectrpc/connect` to talk to downstream services (stubs provided).
- **Centralized Config**: Simplified environment management via `src/config.js`.
- **JWT Authentication**: Secure Bearer token verification.
- **Modular Architecture**: Domain-driven route separation (`user`, `payment`).

## Architecture

```mermaid
graph LR
    User[Client] --> Nginx["Nginx Load Balancer"]
    Nginx --> Bun["Bun API Gateway"]
    Bun --> Redis[Redis]
    Bun --> Auth["JWT Middleware"]
    Bun --> LogFile["Daily Log Files"]
    LogFile --> FluentBit["Fluent Bit"]
    FluentBit --> Output["Stdout / Kafka (Future)"]
    Bun --> ServiceA["User Service (gRPC)"]
    Bun --> ServiceB["Payment Service (gRPC)"]
```

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose

### 1. Project Setup
Initialize environment variables from templates:
```bash
make setup
```

### 2. Run with Docker (Recommended)
Build and start the entire stack (Nginx, Gateway, Redis, Fluent Bit):
```bash
make docker-up
```

### 3. Run Locally (Development)
For faster iteration, run the Gateway locally using Bun. 

First, start only the Redis service:
```bash
make redis
```

Then start the Gateway:
```bash
make dev
```

## Dashboard & Monitoring

- **Redis Insight**: Accessible at [http://localhost:8001](http://localhost:8001).
- **Fluent Bit Logs**: View centralized logs via:
  ```bash
  make docker-logs
  ```
- **Local Logs**: Daily rotating log files are in the `./logs` directory (ignored by git).

## API Endpoints

The gateway listens on port `80` (via Nginx) or `3000` (direct Bun).

### User Service (`/api/v1/user`)

| Method | Endpoint      | Description        | Auth Required |
| :----- | :------------ | :----------------- | :------------ |
| GET    | `/api/v1/user/:id` | Get user details   | Yes           |
| POST   | `/api/v1/user`     | Create a new user  | Yes           |

### Payment Service (`/api/v1/payment`)

| Method | Endpoint           | Description            | Auth Required |
| :----- | :----------------- | :--------------------- | :------------ |
| GET    | `/api/v1/payment/:id` | Get transaction details| Yes           |
| POST   | `/api/v1/payment`     | Process a payment      | Yes           |

## Directory Structure

```
/api-gateway
├── /infra                      # Infrastructure (Nginx, Fluent Bit)
│   ├── /nginx
│   └── /fluent-bit
├── /proto                      # gRPC Protocol Buffers
├── /src
│   ├── /core                   # Core modules (Redis)
│   ├── /logger                 # Daily Rotating Logger
│   ├── /stubs                  # Generated gRPC stubs
│   ├── /client                 # gRPC Client Wrappers
│   ├── /routes                 # Domain Routes
│   ├── /middleware             # Auth & Rate Limiting
│   ├── config.js               # Centralized Configuration
│   └── index.js                # Entry Point
├── Dockerfile.bun              # Gateway Dockerfile
└── docker-compose.yml          # Orchestration
```
