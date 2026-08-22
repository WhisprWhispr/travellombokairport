const json = `{
  "transferMatrix": [
    {"area": "Kuta" "prices": {"Avanza": 150000}}
  ]
}`;

let cleanJson = json.replace(/"\s+"/g, '", "');

try {
    JSON.parse(cleanJson);
    console.log("Fixed!", cleanJson);
} catch(e) {
    console.log("Still broken:", e.message);
}
