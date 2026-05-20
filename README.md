# Bite

Bite is an AI-assisted nutrition tracker built with the MERN stack. It helps users log meals, scan barcodes, track hydration, review nutrition history, and view analytics from a polished React dashboard.

## Features

- User authentication with JWT
- Protected dashboard, profile, meal history, analytics, and scanner pages
- Meal logging with calories, protein, carbs, fats, sugar, and fiber
- Barcode or text-based nutrition lookup with optional Nutritionix integration
- Image upload support with Cloudinary when configured, or Base64 fallback locally
- Daily water tracking with offline sync support
- Admin-only user, meal, and stats views
- Light and dark theme support
- Responsive Vite + React UI with Tailwind CSS and Redux Toolkit

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, React Router, Recharts, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Cloudinary
- Optional APIs: Nutritionix for nutrition lookup, Cloudinary for image hosting

## Project Structure

```text
Bite/
  client/        React frontend
  server/        Express API server
  README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

Install dependencies for both apps:

```bash
cd client
npm install

cd ../server
npm install
```

## Environment Variables

Create `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/ai_nutrition_tracker
JWT_SECRET=replace_with_a_strong_secret

# Optional: Cloudinary image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Nutritionix barcode/text nutrition lookup
NUTRITIONIX_APP_ID=
NUTRITIONIX_APP_KEY=
```

Create `client/.env` only if your API is not running on the default URL:

```env
VITE_API_URL=http://localhost:5001/api
```

If `MONGO_URI` is missing, the server tries the local fallback database at `mongodb://127.0.0.1:27017/ai_nutrition_tracker`.

## Run Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- API base: `http://localhost:5001/api`

## Scripts

Client:

```bash
npm run dev       # start Vite dev server
npm run build     # build production assets
npm run preview   # preview production build
npm run lint      # run ESLint
```

Server:

```bash
npm run dev       # start server with nodemon
npm start         # start server with node
```

## API Overview

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`

Protected:

- `GET /api/profile`
- `PUT /api/profile/update`
- `POST /api/meals/add`
- `GET /api/meals/today`
- `GET /api/meals/history`
- `DELETE /api/meals/:id`
- `POST /api/meals/sync`
- `POST /api/water/add`
- `GET /api/water/today`
- `POST /api/water/sync`
- `POST /api/barcode/scan`

Admin:

- `GET /api/admin/users`
- `GET /api/admin/meals`
- `DELETE /api/admin/meals/:id`
- `GET /api/admin/stats`

Protected routes require an `Authorization: Bearer <token>` header.

## Notes

- Keep `.env` files out of source control.
- Cloudinary is optional. Without it, uploaded images fall back to Base64 strings.
- Nutritionix is optional. Without credentials, the barcode/text lookup uses the app's fallback behavior.
- The client includes local/offline sync support for meals and water logs.
