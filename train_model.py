import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# 1. Load the enriched dataset
df = pd.read_csv('delhi_safety_enriched.csv')

feature_cols = [
    'safer_than_pct', 
    'crime_vs_avg_pct', 
    'police_stations_nearby', 
    'bus_stops_nearby', 
    'street_lighting_score'
]

# 2. Clean feature columns: Strip non-numeric chars and convert to numeric
for col in feature_cols:
    df[col] = df[col].astype(str).str.extract(r'(-?\d+)')[0] # Extract integer numbers (including negative signs)
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0) # Convert to numeric and replace missing values with 0

# 3. Clean target variable
df['risk_score'] = pd.to_numeric(df['risk_score'], errors='coerce').fillna(0)

X = df[feature_cols]
y = df['risk_score']

# 4. Train / Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5. Train Model
print("Training SheSuraksha Safety Score Model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 6. Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {acc * 100:.2f}%\n")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# 7. Save model
joblib.dump(model, 'shesuraksha_model.pkl')
print("Model saved to 'shesuraksha_model.pkl'!")