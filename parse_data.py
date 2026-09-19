import json
import re
import pandas as pd

# Load the JSON dump
with open('safepath_full_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cleaned_data = []

for item in data:
    text = item.get('page_content', '')
    
    # Extract Risk Rating (e.g., safe, low risk, moderate risk, elevated risk, high risk)
    risk_match = re.search(r'SafePath rates it\s+([a-aA-Z\s]+?),', text, re.IGNORECASE)
    risk_level = risk_match.group(1).strip() if risk_match else None
    
    # Extract Percentile (e.g., safer than 98% of mapped Delhi areas)
    safer_match = re.search(r'safer than\s+(\d+)%', text, re.IGNORECASE)
    safer_than_pct = int(safer_match.group(1)) if safer_match else None
    
    # Extract Crime Variance Percentage relative to average (e.g., 78% fewer, 12% more)
    crime_pct_match = re.search(r'about\s+(\d+)%\s+(fewer|more)', text, re.IGNORECASE)
    if crime_pct_match:
        pct_val = int(crime_pct_match.group(1))
        direction = crime_pct_match.group(2).lower()
        crime_vs_avg_pct = -pct_val if direction == 'fewer' else pct_val
    else:
        crime_vs_avg_pct = None

    cleaned_data.append({
        'area': item.get('area'),
        'url': item.get('url'),
        'risk_level': risk_level,
        'safer_than_pct': safer_than_pct,
        'crime_vs_avg_pct': crime_vs_avg_pct
    })

# Convert to DataFrame & export as a proper tabular CSV
df = pd.DataFrame(cleaned_data)
df.to_csv('delhi_safety_data.csv', index=False)

print("Finished! Re-saved structured data to delhi_safety_data.csv")
print(df.head())