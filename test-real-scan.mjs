// Test Gemini 3.5-flash with a real image
async function testScan() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Download a sample travel brochure image and convert to base64
    const imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
    console.log('Downloading test image...');
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(imgBuffer).toString('base64');
    console.log('Image size:', base64Data.length, 'chars');

    const prompt = `Anda adalah asisten AI untuk website travel & rental di Lombok, Indonesia.
Tugas Anda: baca gambar ini dan ekstrak informasi ke dalam format JSON.

Keluarkan HANYA JSON murni (TANPA markdown, TANPA backtick, TANPA penjelasan) dengan struktur:
{
  "title": "Nama layanan",
  "price": 0,
  "category": "Jasa Antar Jemput",
  "description": "Deskripsi singkat"
}

Pastikan HANYA mengembalikan JSON yang valid. Jangan tambahkan apapun selain JSON.`;

    const model = 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log('Sending to', model, '...');
    const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
            }
        })
    });

    console.log('Status:', res.status);
    const result = await res.json();
    
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('=== RAW RESPONSE TEXT ===');
    console.log(responseText);
    console.log('=== END ===');
    
    if (responseText) {
        // Try to parse
        let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            const data = JSON.parse(cleanJson);
            console.log('PARSED OK:', JSON.stringify(data, null, 2));
        } catch(e) {
            console.log('Parse failed:', e.message);
            // Try extracting JSON
            const match = cleanJson.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    const data = JSON.parse(match[0]);
                    console.log('EXTRACTED OK:', JSON.stringify(data, null, 2));
                } catch(e2) {
                    console.log('Extract also failed:', e2.message);
                }
            }
        }
    } else {
        console.log('NO TEXT! Full response:');
        console.log(JSON.stringify(result, null, 2).substring(0, 1000));
    }
}

testScan().catch(e => console.error('FATAL:', e));
