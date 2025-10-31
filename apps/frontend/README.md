# Bookhunt Frontend

This Next.js 14 application provides the Bookhunt user interface. It is styled with Tailwind CSS and connects to the Directus backend through its REST API.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000) to view the app.

The home page fetches the `bookhunt_books` collection from Directus. If the backend is unavailable, the UI falls back to an empty state message.

## Building for Azure App Service

1. Build the production image:
   ```bash
   docker build -t bookhunt-frontend .
   ```
2. Run the container locally for verification:
   ```bash
   docker run --rm -p 3000:3000 \
     -e NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055 \
     bookhunt-frontend
   ```
3. Push the image to Azure Container Registry and deploy it on an Azure App Service plan configured for container images. Set the `PORT`/`WEBSITES_PORT` to `3000` and configure the environment variables through the Azure portal.
