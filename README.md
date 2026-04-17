# KCL Campus Map

An interactive 3D indoor navigation web application for King's College London. Built with React, Three.js, Node.js, Express and MongoDB.

## Live Deployment

- Frontend: https://indoor-mapping-kcl.onrender.com
- Backend API: https://kcl-map.onrender.com

---

## Prerequisites

Before running locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- npm (included with Node.js)

---

## Project Structure

```
react-map-app/
├── client/          # React frontend
│   ├── public/      # Static assets including GLB 3D model
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── utils/        # Wayfinding logic
│       └── __tests__/    # Unit tests
├── server/          # Express backend
│   ├── models/      # Mongoose models
│   └── index.js     # API routes
├── .env             # Environment variables (not included, see below)
└── package.json     # Server dependencies
```

---

## Environment Setup

Create a `.env` file in the root `react-map-app/` directory with the following:

```
MONGO_URI=mongodb://localhost:27017/react-map-app
PORT=3001
```

---

## Running Locally

### 1. Install server dependencies

From the root `react-map-app/` directory:

```bash
npm install
```

### 2. Start MongoDB

Ensure MongoDB is running. On Windows:

```bash
net start MongoDB
```

### 3. Start the server

From the root `react-map-app/` directory:

```bash
npm start
```

The server will run on http://localhost:3001

### 4. Install client dependencies

Open a new terminal and navigate to the client folder:

```bash
cd client
npm install
```

### 5. Start the client

```bash
npm start
```

The app will open at http://localhost:3000

---

## Running Tests

From the `client/` directory:

```bash
npm test -- --watchAll=false --verbose
```

This runs all 31 unit tests across:
- `wayfinding.test.js` — pathfinding algorithm and scene extraction
- `mapTraversal.test.js` — corridor routing through the waypoint graph
- `SearchPanel.test.js` — search panel UI component
- `useRoomData.test.js` — room data fetching hook

---

## Building for Production

From the `client/` directory:

```bash
npm run build
```

This creates an optimised production build in `client/build/`.

---

## Database

The app uses MongoDB with the following collections:

- `building` — building records (e.g. Bush House)
- `floor` — floor records linked to buildings
- `rooms` — room records linked to floors
- `lecturer` — lecturer details linked to rooms

To populate the database, use [MongoDB Compass](https://www.mongodb.com/products/compass) to import data into a local `react-map-app` database.

---

## Key Technologies

| Technology | Purpose |
|---|---|
| React | Frontend UI framework |
| React Three Fiber | 3D rendering in React |
| Three.js | 3D graphics library |
| Express | Backend API server |
| Mongoose | MongoDB object modelling |
| MongoDB | Database |
| Jest | Unit testing |
| React Testing Library | Component testing |
