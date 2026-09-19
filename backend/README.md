# SheSuraksha Backend — Setup Guide

## Folder structure
```
shesuraksha-backend/
├── config/
│   └── db.js                    # MongoDB connection
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── SOSAlert.js
│   ├── TravelRequest.js
│   ├── CrimeRecord.js           # Real crime incidents, geospatial-indexed
│   └── Connection.js            # Connect-request/accept/decline between two users
├── controllers/                 # Business logic for each feature
│   └── (... auth, area, route, sos, circle, chatbot,
│         connection, user)
├── routes/                      # URL -> controller wiring
│   └── (... plus connectionRoutes.js, userRoutes.js)
├── middleware/
│   ├── authMiddleware.js        # JWT "protect" gate for private routes
│   ├── errorMiddleware.js       # Turns errors into { "error": "..." } JSON
│   └── asyncHandler.js          # Removes repetitive try/catch
├── utils/
│   ├── generateToken.js
│   ├── hash.js                  # Shared deterministic hash/random helpers
│   ├── sortUserPair.js          # Consistent ordering for Connection's unique pair index
│   ├── localityCoordinates.js   # Locality name -> lat/lng lookup
│   ├── seedCrimeData.js         # Loads delhi_crime_data.csv into MongoDB once
│   ├── safetyDataEngine.js      # Area audit (data-driven) + route planner (simulated)
│   └── chatbotEngine.js         # Rule-based chatbot replies
├── delhi_crime_data.csv         # Real crime dataset — commit this to git
├── server.js                    # App entry point
├── .env.example                 # Copy to .env and fill in real values
├── .gitignore
└── package.json
```

## Step-by-step setup

### 1. Install Node.js
If you don't have it: download the LTS version from nodejs.org. Check it worked:
```bash
node -v
npm -v
```

### 2. Install dependencies
From inside the `shesuraksha-backend` folder:
```bash
npm install
```
This reads `package.json` and installs express, mongoose, cors, dotenv, jsonwebtoken, and bcryptjs into `node_modules/`.

For auto-restart on file changes during development, also install nodemon (already listed as a devDependency, so `npm install` covers it).

### 3. Create a MongoDB Atlas cluster
1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a free (M0) cluster.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) — fine for a hackathon.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4. Set up environment variables
Copy the example file:
```bash
cp .env.example .env
```
Open `.env` and fill in:
- `MONGODB_URI` — paste your Atlas connection string, replace `<username>` and `<password>`, and add a database name before the `?` (e.g. `/shesuraksha?retryWrites...`).
- `JWT_SECRET` — any long random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `PORT` — leave as `5000` unless it conflicts with something.
- `CLIENT_ORIGIN` — leave as `http://localhost:5173` (Vite's default) unless your teammate's dev server runs elsewhere.

**Never commit `.env`** — it's already listed in `.gitignore`, so `git add .` will skip it automatically.

### 5. Run the server
Development (auto-restarts on save):
```bash
npx nodemon server.js
```
Or plain Node:
```bash
node server.js
```
You should see:
```
MongoDB connected: cluster0-xxxxx.mongodb.net
SheSuraksha API listening on port 5000
```

### 6. Real crime data (Area Safety Audit)
`delhi_crime_data.csv` sits in the project root and is loaded into MongoDB automatically the first time the server starts (see `utils/seedCrimeData.js`, called from `server.js`). On that first run you'll see in the terminal:
```
Seeded 225 crime records into MongoDB from delhi_crime_data.csv.
```
On every later restart it'll instead print `Crime data already seeded (225 records) — skipping.` — it never re-inserts or duplicates.

If you ever want to force a re-seed (e.g. you edited the CSV), drop the collection first: connect via `mongosh` or MongoDB Compass and run `db.crimerecords.deleteMany({})`, then restart the server.

The locality-to-coordinates lookup (`utils/localityCoordinates.js`) currently knows ~35 Delhi-NCR locality names. If your teammate tests with a locality that isn't in that list, the endpoint still works (falls back to a deterministic pseudo-location) — it just won't reflect real nearby incidents. Add more entries to `KNOWN_LOCALITIES` in that file as needed.

### 7. Test it's alive
Open http://localhost:5000 in a browser or run:
```bash
curl http://localhost:5000
```
You should get `{"status":"SheSuraksha API is running"}`.

### 8. Try an endpoint with curl
Area audit against a locality the crime dataset actually covers well (should return a lower, data-driven `safetyScore`):
```bash
curl "http://localhost:5000/api/area-audit?locality=Noida%20Sector%2062"
```
Compare against a locality outside this dataset's coverage (should return `safetyScore: 100` — no known incidents nearby, not "verified safe"):
```bash
curl "http://localhost:5000/api/area-audit?locality=Connaught%20Place"
```

**Connect Here flow** (needs two signed-up users — sign both up first, save both tokens):
```bash
# User A searches for User B
curl "http://localhost:5000/api/users/search?query=Priya" \
  -H "Authorization: Bearer TOKEN_A"

# User A sends a request (recipientId from the search result above)
curl -X POST http://localhost:5000/api/connections/request \
  -H "Authorization: Bearer TOKEN_A" -H "Content-Type: application/json" \
  -d '{ "recipientId": "PASTE_USER_B_ID" }'

# User B sees the pending request and accepts it (connectionId from that response)
curl "http://localhost:5000/api/connections/requests" -H "Authorization: Bearer TOKEN_B"
curl -X PUT http://localhost:5000/api/connections/PASTE_CONNECTION_ID/accept \
  -H "Authorization: Bearer TOKEN_B"

# Now User B posts a trip, and User A can see it in matches (they weren't
# visible to each other before accepting)
curl -X POST http://localhost:5000/api/travel-circle \
  -H "Authorization: Bearer TOKEN_B" -H "Content-Type: application/json" \
  -d '{ "from": "Koramangala", "to": "Whitefield", "departureTime": "2026-09-14T18:30:00.000Z" }'
curl "http://localhost:5000/api/travel-circle/matches" -H "Authorization: Bearer TOKEN_A"
```

Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asha Verma",
    "mobileNumber": "9876543210",
    "password": "hunter2",
    "emergencyContact": { "name": "Meena Verma", "mobileNumber": "9876500000", "relationship": "Mother" }
  }'
```
This returns a `token`. Use it on protected routes:
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

### 9. Share `API_DOCS.md` with your teammate
That file has every endpoint, exact request/response JSON, and status codes. Her React app can be built entirely against that doc — she doesn't need your backend running locally, though it helps for real testing once both sides are ready.

### 10. Deploying later (Render + Atlas)
1. Push this repo to GitHub (`.env` won't be included, which is correct).
2. On Render: **New Web Service** → connect your repo.
3. Build command: `npm install`. Start command: `node server.js`.
4. In Render's **Environment** tab, add the same variables from your `.env` (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN` — set `CLIENT_ORIGIN` to your deployed frontend's URL once it exists).
5. Atlas Network Access already allows `0.0.0.0/0`, so Render can reach it without extra setup.

## A note on the "mock data" endpoints
Area Safety Audit and Route Planner don't have real lighting/crowd/CCTV data sources yet — that's normal for a hackathon. `utils/safetyDataEngine.js` generates consistent, realistic-looking numbers deterministically from the input (locality name, or origin+destination), so the same query always returns the same result. Swap the inside of those functions for real APIs later without changing what the frontend receives.
