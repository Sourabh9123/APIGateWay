# High-Performance API Gateway

A modular, production-ready API Gateway built with **Bun**, **Nginx**, and **Redis**. It handles versioned routing, JWT authentication, and dual-level rate limiting, proxying requests to downstream microservices via **gRPC**.

## Features

- **High Performance**: Built on [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.
- **Load Balancing**: Nginx configured as a reverse proxy and load balancer.
- **Rate Limiting**: Redis-backed sliding window rate limiter.
    - **Authenticated**: Higher limits for logged-in users (ID-based).
    - **Anonymous**: Stricter limits for guests (IP-based).
- **gRPC Clients**: Uses `@connectrpc/connect` to talk to downstream services (stubs provided).
- **JWT Authentication**: Secure Bearer token verification.
- **Modular Architecture**: Domain-driven route separation (`user`, `payment`).

## Architecture

```mermaid
graph LR
    User[Client] --> Nginx[Nginx Load Balancer]
    Nginx --> Bun[Bun API Gateway]
    Bun --> Redis[Redis]
    Bun --> Auth[JWT Middleware]
    Bun --> ServiceA[User Service (gRPC)]
    Bun --> ServiceB[Payment Service (gRPC)]
```

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

1.  **Clone the repository**
2.  **Configure Environment**
    Copy the example or create a `.env` file in the `api-gateway` directory:
    ```env
    PORT=3000
    REDIS_HOST=redis
    REDIS_PORT=6379
    SERVICE_ADDR_USER=http://user-service:3001
    SERVICE_ADDR_PAYMENT=http://payment-service:3002
    JWT_SECRET=supersecretkey
    RATE_LIMIT_WINDOW=60
    RATE_LIMIT_MAX=100
    RATE_LIMIT_AUTH_MAX=500
    ```
3.  **Run with Docker Compose**
    ```bash
    docker compose up --build
    ```

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
├── /infra                      # Infrastructure (Nginx)
├── /proto                      # gRPC Protocol Buffers
├── /src
│   ├── /core                   # Core modules (Redis)
│   ├── /stubs                  # Generated gRPC stubs
│   ├── /client                 # gRPC Client Wrappers
│   ├── /routes                 # Domain Routes
│   ├── /middleware             # Auth & Rate Limiting
│   └── index.js                # Entry Point
├── Dockerfile.bun              # Gateway Dockerfile
└── docker-compose.yml          # Orchestration
```
