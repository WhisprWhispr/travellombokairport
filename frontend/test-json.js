const json = `{
  "title": "Jasa Antar Jemput",
  "transferMatrix": [
    {"area": "Kuta Lombok / Bandara", "prices": {"Avanza": 150000}},
    {"area": "Senggigi", "prices": {"Avanza": 250000}}
  ]
}`;

let cleanJson = json.replace(/("(?:[^"\\]|\\.)*")/gs, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
});

console.log(cleanJson === json);
