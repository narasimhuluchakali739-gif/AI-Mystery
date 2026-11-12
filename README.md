# CASEFILE · AI Mystery Room

A fictional detective investigation game. Build a mystery with Gemini, examine evidence, connect clues, and make an accusation. The React/Vite interface and Express API are served together in production; MongoDB Atlas stores cases and their sealed solutions.

## Run locally

Requirements: Node.js 20 or newer (below 27) and a MongoDB database.

1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` and `GEMINI_API_KEY` in `.env`. Keep the Gemini key server-side; never add a `VITE_` prefix.
3. From the project root, run `npm install` and `npm run dev`.
4. Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

The API uses port 4001 in local development and Vite proxies `/api` requests to it. `GEMINI_MODEL` defaults to the stable `gemini-3.5-flash-lite` model. Never run multiple `npm run dev` sessions for this project at the same time; stop the old session with Ctrl+C before restarting.

## Deploy to Render

This repository includes `render.yaml`, which configures a single Render Node web service. The service builds the React app, serves its static files from Express, and handles `/api/v1/*` on the same HTTPS origin. Render supplies the runtime `PORT`; do not set a fixed `PORT` in Render.

### 1. Prepare the repository

1. Create a private GitHub repository.
2. From this project folder, initialize Git if needed, commit the project, and push the `main` branch. `.env` files, dependencies, and build output are ignored. Before pushing, run `git status` and confirm `.env` is not listed.
3. If Git is not initialized yet, run:

   ```powershell
   git init
   git add .
   git commit -m "Prepare CASEFILE for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

   Replace the GitHub URL with your repository URL.

### 2. Prepare MongoDB Atlas

1. In Atlas, create a database user for CASEFILE. Give it read/write access only to the app database and use a strong password.
2. Keep your existing cluster and database. In **Database → Connect**, copy the application connection string. Replace its username, password, and database name as required; URL-encode special characters in the password.
3. Atlas only accepts connections from addresses on the project's IP access list. After creating the Render service, open its **Connect → Outbound** details and add the listed outbound CIDR ranges to **Atlas → Security → Network Access → IP Access List**. Then redeploy the service. Avoid `0.0.0.0/0` where possible: that allows connections from anywhere.

### 3. Create the Render service

1. Sign in to Render and choose **New → Blueprint**.
2. Connect your GitHub account and select the CASEFILE repository and `main` branch. Render reads the root `render.yaml`.
3. During Blueprint setup, provide `GEMINI_API_KEY` and `MONGODB_URI` when prompted. Use the rotated Gemini API key and the Atlas connection string. Do not put secrets in `render.yaml` or GitHub.
4. Review the service settings. The blueprint uses the Free plan for a low-cost trial; free services can sleep after 15 minutes without traffic, so the first visit after sleep can take about a minute. Choose a paid plan if you need the service to stay available without that delay.
5. Create the Blueprint. If the initial deploy cannot reach Atlas yet, add Render's outbound IP ranges to the Atlas allowlist, then select **Manual Deploy → Deploy latest commit**.

### 4. Check the live deployment

1. In Render, wait for the service status to become **Live** and open its `onrender.com` URL.
2. Check `https://YOUR-SERVICE.onrender.com/api/v1/health`. It should report `database: connected` and `generator: configured`. The health endpoint does not reveal credentials.
3. Open `/create`, enter a fictional scenario of at least 30 characters, and build a case. Confirm evidence loads and the solution remains sealed until you make an accusation.
4. If deployment fails, inspect the Render **Events/Logs** page. Database connection failures usually mean the connection string, database user permissions, password encoding, or Atlas IP allowlist needs attention.

### Render build configuration

The Blueprint uses:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check: `/api/v1/health`
- Runtime secrets: `GEMINI_API_KEY`, `MONGODB_URI`
- Model: `gemini-3.5-flash-lite`

## API

- `GET /api/v1/health` — service readiness without exposing secrets.
- `POST /api/v1/cases` — validate a scenario and generate a complete case.
- `GET /api/v1/cases/:caseId` — return player-safe case details.
- `POST /api/v1/cases/:caseId/accusations` — evaluate an accusation and reveal the stored solution.

The app rate-limits API requests and limits request bodies. It currently has no user accounts or per-user case ownership; anyone who can access a case ID may use its case endpoints. Add authentication and ownership controls before using it for private or sensitive cases.

## Build

`npm test` runs deterministic API generation and error-mapping tests. `npm run build` compiles the API and production web assets.
