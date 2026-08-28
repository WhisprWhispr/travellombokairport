export async function onRequestPost(context) {
    try {
        const { request } = context;
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        const cloudName = 'mvhjuh83';
        const apiKey = '636819913243949';
        const apiSecret = 'Klov4BCszxgMpPmr_PUD9GFvgJw';
        
        // Generate timestamp for signature
        const timestamp = Math.round((new Date).getTime() / 1000);

        // String to sign: timestamp=...<api_secret>
        const strToSign = `timestamp=${timestamp}${apiSecret}`;

        // Create SHA-1 signature using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(strToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Prepare FormData for Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('api_key', apiKey);
        cloudinaryFormData.append('timestamp', timestamp);
        cloudinaryFormData.append('signature', signature);
        
        // Upload to Cloudinary REST API
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: cloudinaryFormData
        });

        if (!cloudinaryRes.ok) {
            const errResult = await cloudinaryRes.text();
            return new Response(JSON.stringify({ error: 'Failed to upload to Cloudinary', details: errResult }), { status: 500 });
        }

        const result = await cloudinaryRes.json();
        
        return new Response(JSON.stringify({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { status: 500 });
    }
}
