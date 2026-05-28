.PHONY: install dev dev-web dev-api dev-worker build lint typecheck test db-generate db-migrate docker-up docker-down clean

install:
	corepack enable
	corepack prepare pnpm@11.4.0 --activate
	pnpm install --save-exact

dev:
	pnpm dev

dev-web:
	pnpm dev:web

dev-api:
	pnpm dev:api

dev-worker:
	pnpm dev:worker

build:
	pnpm build

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

docker-up:
	docker compose up -d postgres redis minio

docker-down:
	docker compose down

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules .turbo dist coverage
	find apps packages -type d \( -name dist -o -name .next -o -name coverage \) -prune -exec rm -rf {} +
