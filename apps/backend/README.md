# Bookhunt Backend

This directory contains the infrastructure needed to run the Bookhunt backend using [Directus](https://directus.io/) on top of PostgreSQL. The stack is provisioned through Docker Compose and is ready to run in Azure using container apps, container instances, or a virtual machine.

## Services

- **Directus** – provides the API and admin interface.
- **PostgreSQL** – stores application data. A bootstrap script creates a `bookhunt_books` table to validate connectivity with the frontend.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or a compatible Docker engine
- [Docker Compose v2](https://docs.docker.com/compose/)

## Usage

1. Copy the `.env.example` file to `.env` and adjust secrets as needed:
   ```bash
   cp .env.example .env
   ```
2. Start the stack:
   ```bash
   docker compose up -d
   ```
3. Access Directus at [http://localhost:8055](http://localhost:8055) and log in with the admin credentials from `.env`.
4. Apply the bundled schema to register the `bookhunt_books` collection with Directus:
   ```bash
   docker compose exec directus npx directus schema apply --yes --yaml /directus/schema.yaml
   ```
5. The PostgreSQL service automatically creates the `bookhunt_books` table. You can verify it from the Directus admin UI under **Content**.

## Deploying to Azure

- Use [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/) or [Azure Container Instances](https://learn.microsoft.com/azure/container-instances/) to deploy both the Directus and PostgreSQL containers.
- Store secrets such as the Directus `KEY`, `SECRET`, and database passwords using [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/) or the Azure App Service configuration settings.
- For production, replace the default credentials and configure persistent storage (Azure Files, Azure PostgreSQL, etc.).
