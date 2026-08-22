const fs = require('fs');

async function check() {
    const apiKey = "AIzaSyA6iPEJgUiZpRkt6YMaIk4Z2tglVF1MiBs";
    const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    
    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log("Trying", model);
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{parts: [{text: "Hi"}]}]
            })
        });
        console.log(model, "status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log(JSON.stringify(data).substring(0, 100));
        } else {
            console.log(await res.text());
        }
    }
}
check();
