const json = `{
  "transferMatrix": [
    {"area": "Kuta", "prices": {"Avanza": 150000}}
    {"area": "Senggigi", "prices": {"Avanza": 250000}}
  ]
}`;

let cleanJson = json.replace(/\}\s*\{/g, '},{');

try {
    JSON.parse(cleanJson);
    console.log("Fixed!");
} catch(e) {
    console.log("Still broken:", e.message);
}
