const crypto = require('crypto');

async function testUpload() {
    const cloudName = 'mvhjuh83';
    const apiKey = '636819913243949';
    const apiSecret = 'Klov4BCszxgMpPmr_PUD9GFvgJw';
    
    const timestamp = Math.round((new Date).getTime() / 1000);
    const strToSign = `timestamp=${timestamp}${apiSecret}`;

    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    console.log("Timestamp:", timestamp);
    console.log("Signature:", signature);

    const formData = new FormData();
    // we need a dummy file. Let's use a base64 string
    formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });
    
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
}

testUpload();
