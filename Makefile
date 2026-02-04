.PHONY: setup dev docker-up docker-down docker-logs clean

# Setup environment files from examples
setup:
	@echo "Setting up environment files..."
	@cp -n .env.example .env || echo ".env already exists"
	@cp -n env/.env.example env/.env || echo "env/.env already exists"
	@echo "Setup complete."

# Run the API Gateway locally using Bun
dev:
	@echo "Starting API Gateway locally..."
	bun run dev

# Start only Redis Stack (useful for local development)
redis:
	@echo "Starting Redis Stack..."
	docker compose up -d redis

# Start the full Docker stack
docker-up:
	@echo "Starting Docker stack..."
	docker compose up --build -d

# Stop the Docker stack
docker-down:
	@echo "Stopping Docker stack..."
	docker compose down

# Follow Docker logs for core services
docker-logs:
	@echo "Following Docker logs (Gateway & Fluent Bit)..."
	docker compose logs -f gateway fluent-bit

# Clean up logs and temporary files
clean:
	@echo "Cleaning up..."
	rm -rf logs/*.log
	@echo "Cleanup complete."
