import fs from 'fs';

async function test() {
    // Read key from .env
    const env = fs.readFileSync('../backend/.env', 'utf-8');
    const match = env.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : '';

    const systemPrompt = "Anda adalah asisten AI";
    const contents = [
        {
            role: "user",
            parts: [{ text: systemPrompt }]
        },
        {
            role: "model",
            parts: [{ text: "Siap!" }]
        },
        {
            role: "user",
            parts: [{ text: "hi" }]
        }
    ];

    const requestBody = JSON.stringify({
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
        }
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
    });

    const text = await res.text();
    console.log(res.status, text);
}

test();
