# Bookhunt Monorepo

Bookhunt is a monorepo that bundles a Directus backend and a responsive Next.js frontend for cataloguing books. The project is designed to run locally with Docker and to deploy to Azure services.

## Structure

```
apps/
  backend/    # Directus + PostgreSQL infrastructure (Docker Compose)
  frontend/   # Next.js 14 + Tailwind CSS application
```

## Getting Started

### Backend (Directus + PostgreSQL)

1. Copy environment variables and start the stack:
   ```bash
   cd apps/backend
   cp .env.example .env
   docker compose up -d
   ```
2. Register the Bookhunt schema with Directus so that the REST API exposes the `bookhunt_books` collection:
   ```bash
   docker compose exec directus npx directus schema apply --yes --yaml /directus/schema.yaml
   ```
3. Directus is available at [http://localhost:8055](http://localhost:8055). Log in using the credentials in `.env`.
4. The bootstrap SQL script creates a `bookhunt_books` collection used by the frontend to confirm API connectivity.

### Frontend (Next.js + Tailwind CSS)

1. Install dependencies:
   ```bash
   npm install --prefix apps/frontend
   ```
2. Copy environment variables:
   ```bash
   cd apps/frontend
   cp .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev --prefix apps/frontend
   ```
4. Visit [http://localhost:3000](http://localhost:3000) to see the responsive UI that pulls data from Directus.

## Azure Deployment Notes

- **Frontend**: Use the provided `Dockerfile` in `apps/frontend` to build a container image. Publish it to [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/) and deploy via an [Azure App Service plan](https://learn.microsoft.com/azure/app-service/overview). Configure environment variables (`NEXT_PUBLIC_DIRECTUS_URL`, etc.) in the App Service configuration.
- **Backend**: Deploy the Directus and PostgreSQL services using [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/), [Azure Kubernetes Service](https://learn.microsoft.com/azure/aks/), or managed PostgreSQL offerings. Ensure persistent storage and secure secret management.

## Testing Connectivity

Once both services are running and the schema has been applied, the frontend issues a REST request to `GET /items/bookhunt_books` on the Directus API. Any entries added through Directus will be rendered in the "Latest Books" section of the UI.
