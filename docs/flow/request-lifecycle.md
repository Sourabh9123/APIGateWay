# Request Lifecycle & Middleware Flow

This document details the step-by-step journey of a request as it passes through the API Gateway.

## 1. Entry Point: Nginx
- **Role**: Reverse Proxy & Load Balancer.
- **Action**: Receives the request on port `80`. It adds proxy headers like `X-Forwarded-For` and `X-Real-IP` and forwards the request to the Bun application on `localhost:3000`.

## 2. Bun Entry Point (`index.js`)
- **Action**: The `fetch` handler receives the request and immediately wraps it in the `correlationIdMiddleware`.
- **Status**: The request enters the **AsyncLocalStorage** context here.

## 3. Correlation Middleware (`correlation.js`)
- **Action**: 
    - Generates a unique, shuffled **Correlation ID**.
    - Stores the ID and a **Sequence Counter** (`seq: 1`) in `AsyncLocalStorage`.
    - Starts a high-resolution timer.
- **Why**: This ensures every subsequent log generated during this request is automatically linked to this ID.

## 4. Master Router (`router.js`)
The request enters the routing logic and hits the following checks in order:

### A. Rate Limiting (`ratelimit.js`)
- **Action**: Checks Redis for the request count in the current time window.
- **Logic**: 
    - Differentiates between IP-based (Guest) and ID-based (Authenticated) limits.
- **Failure**: Returns `429 Too Many Requests` + Logs the event.

### B. Public Route Check
- **Action**: Matches the URL path against `PUBLIC_ROUTES` (e.g., `POST /api/v1/user`).
- **If Public**: Skips step C (Authentication).
- **If Private**: Proceeds to Authentication.

### C. Authentication (`auth.js`)
- **Action**: Extracts the `Bearer` token from `Authorization` header.
- **Logic**: Verifies the JWT using the `SECRET_KEY`.
- **Failure (Unauthorized)**: 
    - `logger.warn` is triggered (Log appended with sequence suffix).
    - Returns `401 Unauthorized` response immediately.
    - Control passes back to the **Finally** block of the Correlation Middleware.

## 5. Domain Routing (`v1/index.js`)
- **Action**: Based on the path (e.g., `/user` or `/payment`), the request is handed to the specific domain router.
- **Status**: gRPC clients are invoked to talk to downstream microservices.

## 6. Exit: Correlation Middleware (Finally Block)
Whether the request succeeded or failed (401, 429, 500, or 200), it always finishes here.
- **Action**:
    - Calculates `durationMs`.
    - Captures final status and error details.
    - **Final Log**: Generates the "Request Completed/Failed" log entry.
    - **Header Injection**: Adds `x-correlation-id` and `x-response-time` to the client response.

---

## Example Scenario: Failed Authentication Flow

1. **Client** sends `GET /api/v1/user/123` with no token.
2. **Nginx** forwards to **Gateway**.
3. **Correlation Middleware** generates ID `X7Y8...` and sequence `1`.
4. **Master Router** performs **Rate Limit Search** (OK).
5. **Master Router** checks **Public Routes** (Matches: No).
6. **Auth Middleware** checks token -> Missing.
    - **LOG**: `{"correlationId":"X7Y8...-1", "level":"warn", "message":"Authentication failed..."}`
    - Returns `401 Response`.
7. **Correlation Middleware** catches the 401 in `finally`:
    - **LOG**: `{"correlationId":"X7Y8...-2", "level":"warn", "message":"Request Completed with Warning: GET /api/v1/user/123 [user] - 401 (2ms)"}`
    - Injects Headers.
8. **Client** receives 401.
