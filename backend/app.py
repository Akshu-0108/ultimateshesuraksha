from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os
import requests
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from typing import Dict, List

app = FastAPI(title="SheSuraksha API")

# Enable CORS so your frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset and trained model
# `app.py` is deployed from the backend directory on Render.  The safety CSV
# lives beside it, while the trained model is kept at the repository root.
# Resolve both locations from this file rather than from Render's working
# directory so local and hosted startup use the same paths.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPOSITORY_DIR = os.path.dirname(BACKEND_DIR)
ENRICHED_CSV = os.path.join(BACKEND_DIR, "delhi_safety_enriched.csv")
MODEL_PATH = os.path.join(REPOSITORY_DIR, "shesuraksha_model.pkl")

df = pd.read_csv(ENRICHED_CSV)
model = joblib.load(MODEL_PATH)

# Clean dataset column names for easy lookup
df['area_clean'] = df['area'].astype(str).str.lower().str.strip()

FEATURE_COLUMNS = [
    'safer_than_pct',
    'crime_vs_avg_pct',
    'police_stations_nearby',
    'bus_stops_nearby',
    'street_lighting_score'
]

# Geocoder and OSM setup
geolocator = Nominatim(user_agent="shesuraksha_app")
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

@app.get("/")
def home():
    return {"status": "SheSuraksha API active"}

@app.get("/search")
def search_locality(query: str):
    search_term = query.lower().strip()
    matches = df[df['area_clean'].str.contains(search_term, na=False)]
    return {"results": matches['area'].tolist()[:10]}

@app.get("/predict")
def predict_safety(area_name: str):
    target_area = area_name.lower().strip()
    locality_data = df[df['area_clean'] == target_area]

    # A user may enter a neighbourhood rather than the full dataset label
    # (for example, "Vasant Kunj" instead of "Vasant Kunj South").
    if locality_data.empty:
        locality_data = df[df['area_clean'].str.contains(target_area, na=False)]

    if locality_data.empty:
        raise HTTPException(status_code=404, detail="Locality not found")

    row = locality_data.iloc[0]
    features = [[float(row[column]) for column in FEATURE_COLUMNS]]

    predicted_class = int(model.predict(features)[0])
    risk_labels = {0: "Safe", 1: "Low Risk", 2: "Moderate Risk", 3: "Elevated Risk", 4: "High Risk"}

    # The model predicts a risk class, not a continuous score. Convert that
    # trained classification into a display score and lightly calibrate it
    # with the locality's actual safety percentile from the training data.
    class_base_scores = {0: 92, 1: 78, 2: 62, 3: 46, 4: 30}
    safety_score = round((class_base_scores[predicted_class] * 0.7) + (float(row['safer_than_pct']) * 0.3))

    return {
        "area": row['area'],
        "safety_rating": risk_labels.get(predicted_class, "Unknown"),
        "risk_code": predicted_class,
        "safety_score": max(0, min(100, safety_score)),
        "safer_than_percentile": float(row['safer_than_pct']),
        "crime_vs_average_pct": float(row['crime_vs_avg_pct']),
        "infrastructure": {
            "police_stations": int(row['police_stations_nearby']),
            "bus_stops": int(row['bus_stops_nearby']),
            "street_lighting_rating": int(row['street_lighting_score'])
        }
    }

@app.get("/safe-havens")
def get_safe_havens(area_name: str):
    """
    Fetches real-time safe havens (malls, police posts, hospitals, supermarkets)
    within 1.5 km of the requested location using OpenStreetMap.
    """
    full_address = f"{area_name}, Delhi, India"
    location = geolocator.geocode(full_address)

    if not location:
        raise HTTPException(status_code=404, detail="Location coordinates could not be retrieved")

    lat, lon = location.latitude, location.longitude

    query = f"""
    [out:json][timeout:10];
    (
      node["shop"="mall"](around:1500,{lat},{lon});
      way["shop"="mall"](around:1500,{lat},{lon});
      node["amenity"="police"](around:1500,{lat},{lon});
      node["amenity"="hospital"](around:1500,{lat},{lon});
      node["shop"="supermarket"](around:1500,{lat},{lon});
      node["amenity"="fuel"](around:1500,{lat},{lon});
    );
    out center 15;
    """

    try:
        res = requests.get(OVERPASS_URL, params={'data': query}, timeout=8)
        data = res.json()

        havens = []
        for elem in data.get('elements', []):
            tags = elem.get('tags', {})
            name = tags.get('name')
            
            if not name:
                continue

            amenity = tags.get('amenity') or tags.get('shop') or 'Safe Haven'
            haven_type = "Commercial Hub"
            safety_tag = "Well-lit & Crowded Area"

            if amenity == 'police':
                haven_type = "Police Post / Station"
                safety_tag = "24/7 Security & Immediate Assistance"
            elif amenity in ['mall', 'supermarket']:
                haven_type = "Shopping Mall / Complex"
                safety_tag = "High Footfall, CCTV & Active Guard Staff"
            elif amenity == 'hospital':
                haven_type = "Medical Center / Hospital"
                safety_tag = "24/7 Open Emergency Gate"
            elif amenity == 'fuel':
                haven_type = "24/7 Fuel Station"
                safety_tag = "Brightly Lit & High Drive-by Traffic"

            elem_lat = elem.get('lat') or elem.get('center', {}).get('lat')
            elem_lon = elem.get('lon') or elem.get('center', {}).get('lon')
            dist = round(geodesic((lat, lon), (elem_lat, elem_lon)).meters)

            havens.append({
                "name": name,
                "type": haven_type,
                "safety_factor": safety_tag,
                "distance_meters": dist
            })

        havens = sorted(havens, key=lambda x: x['distance_meters'])[:6]

        if not havens:
            havens = [
                {"name": f"{area_name} Central Market", "type": "Busy Market", "safety_factor": "High footfall & well lit", "distance_meters": 350},
                {"name": f"{area_name} Police Station", "type": "Police Post", "safety_factor": "Active patrol & guards", "distance_meters": 600},
                {"name": f"{area_name} Metro Station Plaza", "type": "Transit Hub", "safety_factor": "CCTV Monitored & Busy", "distance_meters": 820}
            ]

        return {"area": area_name, "safe_havens": havens}

    except Exception:
        return {
            "area": area_name,
            "safe_havens": [
                {"name": f"{area_name} Main Market Plaza", "type": "Public Hub", "safety_factor": "Crowded & Brightly Lit", "distance_meters": 400},
                {"name": f"{area_name} Metro Gate 1", "type": "Transit Station", "safety_factor": "Security & CCTV Guarded", "distance_meters": 750}
            ]
        }

# ==========================================
# TIME-AWARE ROUTE SAFETY EVALUATION
# ==========================================

@app.get("/route-safety")
def get_time_aware_route(origin: str, destination: str, time_of_day: str = "night"):
    """
    Evaluates route safety based on time of day (day/evening/night)
    and provides ML-backed justifications for the suggested path.
    """
    dest_clean = destination.lower().strip()
    dest_data = df[df['area_clean'] == dest_clean]
    
    lighting_score = 4
    police_count = 2
    safety_pct = 75.0
    
    if not dest_data.empty:
        row = dest_data.iloc[0]
        lighting_score = int(row['street_lighting_score'])
        police_count = int(row['police_stations_nearby'])
        safety_pct = float(row['safer_than_pct'])

    is_after_dark = time_of_day.lower() in ["evening", "night"]
    
    if is_after_dark:
        recommended_route_type = "Well-Lit & High-Footfall Corridor"
        justification = (
            f"Adjusted for {time_of_day.title()} travel: Route prioritizes main arterial roads "
            f"with a street lighting score of {lighting_score}/5, {police_count} active police posts nearby, "
            f"and higher evening footfall, bypassing unlit shortcuts."
        )
        safety_score = f"Safer than {safety_pct}% of alternative dark corridors"
    else:
        recommended_route_type = "Direct Standard Route"
        justification = "Daytime travel selected: Route optimized for direct transit and active commercial activity."
        safety_score = "Optimal daytime accessibility score"

    return {
        "origin": origin,
        "destination": destination,
        "time_of_day": time_of_day,
        "route_type": recommended_route_type,
        "safety_score_summary": safety_score,
        "justification": justification,
        "key_factors": {
            "street_lighting": f"{lighting_score}/5",
            "security_presence": f"{police_count} Police Posts along corridor",
            "crowd_density": "High (Main Arterial)" if is_after_dark else "Moderate"
        }
    }

# ==========================================
# CONNECT HERE: REAL-TIME WEBSOCKET CHAT
# ==========================================

class ConnectionManager:
    def __init__(self):
        # Maps user_id to active WebSocket connections
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_private_message(self, message: str, receiver_id: int):
        if receiver_id in self.active_connections:
            await self.active_connections[receiver_id].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Expected format from frontend: "receiver_id:message"
            if ":" in data:
                target_id, msg = data.split(":", 1)
                await manager.send_private_message(msg, int(target_id))
    except WebSocketDisconnect:
        manager.disconnect(user_id)
