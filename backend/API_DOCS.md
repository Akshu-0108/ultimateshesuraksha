# SheSuraksha API Documentation

Base URL (local dev): `http://localhost:5000/api`
Base URL (production): _fill in once deployed on Render_

All request/response bodies are JSON. All error responses use this shape:
```json
{ "error": "Human-readable message" }
```

**Auth header** (for endpoints marked 🔒 Private): every request must include
```
Authorization: Bearer <token>
```
The token is returned by signup/login and expires after 30 days.

---

## 1. Auth & Safety Profile

### Sign up
`POST /auth/signup` — 🌐 Public

Request body:
```json
{
  "name": "Asha Verma",
  "mobileNumber": "9876543210",
  "password": "hunter2",
  "emergencyContact": {
    "name": "Meena Verma",
    "mobileNumber": "9876500000",
    "relationship": "Mother"
  }
}
```

Success `201`:
```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Asha Verma",
  "mobileNumber": "9876543210",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errors: `400` (missing fields, or mobile number already registered), `500`

---

### Log in
`POST /auth/login` — 🌐 Public

Request body:
```json
{ "mobileNumber": "9876543210", "password": "hunter2" }
```

Success `200`:
```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Asha Verma",
  "mobileNumber": "9876543210",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errors: `400` (invalid credentials), `500`

---

### Get my profile
`GET /auth/profile` — 🔒 Private

No request body.

Success `200`:
```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Asha Verma",
  "mobileNumber": "9876543210",
  "emergencyContact": {
    "name": "Meena Verma",
    "mobileNumber": "9876500000",
    "relationship": "Mother"
  },
  "isVerified": false
}
```

Errors: `401` (missing/invalid token), `404` (user deleted), `500`

---

### Update my profile
`PUT /auth/profile` — 🔒 Private

Request body (send only the fields you want to change):
```json
{
  "name": "Asha V.",
  "emergencyContact": { "relationship": "Guardian" }
}
```

Success `200`:
```json
{
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Asha V.",
  "mobileNumber": "9876543210",
  "emergencyContact": {
    "name": "Meena Verma",
    "mobileNumber": "9876500000",
    "relationship": "Guardian"
  }
}
```

Errors: `400`, `401`, `404`, `500`

---

## 2. Area Safety Audit

### Get safety stats for a locality
`GET /area-audit?locality=Noida Sector 62` — 🌐 Public

Optional query param: `radiusKm` (number, default `2`) — how far to search for nearby crime records when computing `safetyScore`.

Success `200`:
```json
{
  "locality": "Noida Sector 62",
  "illuminationPercent": 78,
  "crowdDensityLevel": "moderate",
  "safeHavenCount": 12,
  "policeResponseTimeMinutes": 7,
  "safetyScore": 81,
  "lastUpdated": "2026-09-13T10:15:30.000Z"
}
```
`crowdDensityLevel` is one of: `"low" | "moderate" | "high" | "very high"`

**Response shape is unchanged** from before. What changed internally: `safetyScore` is now computed from real Delhi-NCR crime incident data (from `delhi_crime_data.csv`, seeded into MongoDB at server startup) — more and more-severe incidents within `radiusKm` of the locality lower the score. `illuminationPercent`, `crowdDensityLevel`, `safeHavenCount`, and `policeResponseTimeMinutes` are still simulated (no real data source for those yet).

**Coverage note:** the dataset's incidents cluster around Noida / Ghaziabad / East Delhi. Localities recognized by name (see `utils/localityCoordinates.js` for the full list — includes Noida, Ghaziabad, Mayur Vihar, Connaught Place, Dwarka, Rohini, and ~25 others) use their real coordinates; anything not on that list gets a deterministic fallback position. A locality with 0 nearby incidents in the dataset will show `safetyScore: 100` — that means "no known incidents nearby in this dataset," not "verified safe."

Errors: `400` (missing `locality`, or invalid `radiusKm`), `500`

---

## 3. Route Planner

### Get ranked route options
`POST /routes/plan` — 🌐 Public

Request body:
```json
{ "origin": "Indiranagar", "destination": "MG Road" }
```

Success `200`:
```json
{
  "origin": "Indiranagar",
  "destination": "MG Road",
  "routes": [
    {
      "routeId": "route_48213_0",
      "routeName": "Well-Lit Bypass",
      "estimatedTimeMinutes": 22,
      "distanceKm": 5.4,
      "safetyScore": 84,
      "breakdown": {
        "lightingScore": 88,
        "crowdScore": 80,
        "cctvCoverageScore": 84
      }
    },
    {
      "routeId": "route_48213_1",
      "routeName": "Main Road Route",
      "estimatedTimeMinutes": 18,
      "distanceKm": 4.9,
      "safetyScore": 71,
      "breakdown": {
        "lightingScore": 65,
        "crowdScore": 75,
        "cctvCoverageScore": 73
      }
    }
  ]
}
```
`routes` is sorted safest-first and contains 2-3 entries.

Errors: `400` (missing `origin` or `destination`), `500`

---

## 4. Emergency SOS

### Trigger an SOS alert
`POST /sos` — 🔒 Private

Request body:
```json
{
  "location": { "lat": 12.9352, "lng": 77.6146 },
  "message": "Walking alone, feeling unsafe"
}
```
`message` is optional.

Success `201`:
```json
{
  "sosId": "66f1a2b3c4d5e6f7a8b9c0e2",
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "location": { "lat": 12.9352, "lng": 77.6146 },
  "message": "Walking alone, feeling unsafe",
  "status": "active",
  "createdAt": "2026-09-13T10:20:00.000Z"
}
```

Errors: `400` (missing/invalid location), `401`, `500`

---

### Get a specific SOS alert
`GET /sos/:id` — 🔒 Private

Success `200`: same shape as the create response above.

Errors: `401`, `404` (no alert with that ID), `500`

---

### Get my SOS history
`GET /sos/history` — 🔒 Private

Success `200`:
```json
{
  "alerts": [
    {
      "sosId": "66f1a2b3c4d5e6f7a8b9c0e2",
      "location": { "lat": 12.9352, "lng": 77.6146 },
      "message": "Walking alone, feeling unsafe",
      "status": "active",
      "createdAt": "2026-09-13T10:20:00.000Z"
    }
  ]
}
```

Errors: `401`, `500`

---

## 5. Connections ("Connect Here")

People can only see each other's travel requests after a mutual connection is accepted — like following/friend requests, not open matching. All endpoints below are 🔒 Private.

### Search for people to connect with
`GET /users/search?query=priya` — 🔒 Private

Case-insensitive partial match on name. Excludes yourself. Each result includes `connectionStatus` so the frontend knows which button to show.

Success `200`:
```json
{
  "users": [
    {
      "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Priya Nair",
      "mobileNumber": "9876543210",
      "connectionStatus": "none"
    }
  ]
}
```
`connectionStatus` is one of: `"none" | "pending_sent" | "pending_received" | "connected" | "declined"`

Errors: `400` (missing `query`), `401`, `500`

---

### Send a connection request
`POST /connections/request` — 🔒 Private

Request body:
```json
{ "recipientId": "66f1a2b3c4d5e6f7a8b9c0d1" }
```

Success `201`:
```json
{
  "connectionId": "66f1a2b3c4d5e6f7a8b9c0e5",
  "requesterId": "66f1a2b3c4d5e6f7a8b9c0d0",
  "recipientId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "status": "pending",
  "createdAt": "2026-09-13T11:00:00.000Z"
}
```

Errors: `400` (missing `recipientId`, sending to yourself, request already pending, or already connected), `401`, `404` (recipient doesn't exist), `500`

---

### Accept a connection request
`PUT /connections/:id/accept` — 🔒 Private

`:id` is the `connectionId`. Only the recipient of the request can accept it.

No request body.

Success `200`:
```json
{
  "connectionId": "66f1a2b3c4d5e6f7a8b9c0e5",
  "requesterId": "66f1a2b3c4d5e6f7a8b9c0d0",
  "recipientId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "status": "accepted",
  "updatedAt": "2026-09-13T11:05:00.000Z"
}
```

Errors: `400` (request isn't pending — already accepted/declined), `401`, `403` (you're not the recipient), `404`, `500`

---

### Decline a connection request
`PUT /connections/:id/decline` — 🔒 Private

Same shape as accept, but `status` becomes `"declined"`.

Errors: `400`, `401`, `403`, `404`, `500`

---

### Get my accepted connections ("My Circle")
`GET /connections` — 🔒 Private

Success `200`:
```json
{
  "connections": [
    {
      "connectionId": "66f1a2b3c4d5e6f7a8b9c0e5",
      "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Priya Nair",
      "mobileNumber": "9876543210",
      "connectedSince": "2026-09-13T11:05:00.000Z"
    }
  ]
}
```

Errors: `401`, `500`

---

### Get pending requests sent to me
`GET /connections/requests` — 🔒 Private

Success `200`:
```json
{
  "requests": [
    {
      "connectionId": "66f1a2b3c4d5e6f7a8b9c0e5",
      "requesterId": "66f1a2b3c4d5e6f7a8b9c0d0",
      "requesterName": "Asha Verma",
      "requesterMobileNumber": "9876500000",
      "createdAt": "2026-09-13T11:00:00.000Z"
    }
  ]
}
```

Errors: `401`, `500`

---

## 6. Peer Travel Circles

### Post a travel request
`POST /travel-circle` — 🔒 Private — **unchanged**

Request body:
```json
{
  "from": "Koramangala",
  "to": "Whitefield",
  "departureTime": "2026-09-14T18:30:00.000Z",
  "verifiedOnly": true
}
```
`departureTime` must be an ISO date string. `verifiedOnly` is optional (defaults to `false`) — kept for backward compatibility, but no longer affects who can see the trip (connections do — see below).

Success `201`:
```json
{
  "requestId": "66f1a2b3c4d5e6f7a8b9c0f3",
  "userId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "from": "Koramangala",
  "to": "Whitefield",
  "departureTime": "2026-09-14T18:30:00.000Z",
  "verifiedOnly": true,
  "createdAt": "2026-09-13T10:25:00.000Z"
}
```

Errors: `400` (missing fields or bad date), `401`, `500`

---

### Find matching travel requests ⚠️ CHANGED
`GET /travel-circle/matches` — 🔒 Private

**Safety model change:** this no longer searches all users' trips. It now ONLY returns trips posted by people in your accepted connections list ("My Circle"). If you have no accepted connections yet, this returns an empty list — never open matches with strangers.

`from`, `to`, and `time` are now **optional** query params (previously required) — if provided, they narrow results *within* your circle; they no longer control visibility.
Example: `GET /travel-circle/matches?from=Koramangala&to=Whitefield&time=2026-09-14T18:30:00.000Z`
Or with no filters at all: `GET /travel-circle/matches` — returns every open trip posted by anyone in your circle.

Success `200`:
```json
{
  "matches": [
    {
      "requestId": "66f1a2b3c4d5e6f7a8b9c0f9",
      "userName": "Priya Nair",
      "from": "Koramangala",
      "to": "Whitefield",
      "departureTime": "2026-09-14T18:45:00.000Z",
      "verifiedOnly": false
    }
  ]
}
```
**Response shape change:** `userVerified` has been removed (the verification concept is superseded by the connections model — you already know who these people are).

Errors: `400` (bad `time` format, if `time` is provided), `401`, `500`

---

### Get my posted travel requests
`GET /travel-circle/mine` — 🔒 Private — **unchanged**

Success `200`:
```json
{
  "requests": [
    {
      "requestId": "66f1a2b3c4d5e6f7a8b9c0f3",
      "from": "Koramangala",
      "to": "Whitefield",
      "departureTime": "2026-09-14T18:30:00.000Z",
      "verifiedOnly": true,
      "createdAt": "2026-09-13T10:25:00.000Z"
    }
  ]
}
```

Errors: `401`, `500`

---

## 7. AI Chatbot

### Send a message, get a reply
`POST /chatbot/message` — 🌐 Public

Request body:
```json
{ "message": "I feel unsafe walking home" }
```

Success `200`:
```json
{
  "reply": "If you're in immediate danger, use the SOS button to alert your emergency contacts now. Do you want me to guide you through it?",
  "intent": "emergency_guidance"
}
```
`intent` is one of: `"emergency_guidance" | "route_help" | "area_audit_help" | "travel_circle_help" | "greeting" | "unknown"` — useful if the frontend wants to show quick-action buttons based on intent.

Errors: `400` (empty/missing message), `500`

---

## Status code summary (applies to every endpoint)
| Code | Meaning |
|------|---------|
| 200  | Success (GET, PUT) |
| 201  | Success, resource created (POST that creates something) |
| 400  | Bad request — missing/invalid fields, shown in `error` |
| 401  | Missing or invalid auth token (private routes only) |
| 404  | Resource not found |
| 500  | Unexpected server error |

## CORS
The API allows requests from `http://localhost:5173` (Vite's default dev port) by default, configured via `CLIENT_ORIGIN` in the backend's `.env`. If your dev server runs on a different port, tell your backend teammate to update that value.
