import { Hono } from 'hono';

const router = new Hono();

router.post('/upload', async (c) => {
    try {
        // Parse the incoming form data
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
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
            console.error("Cloudinary upload failed:", errResult);
            return c.json({ error: 'Failed to upload to Cloudinary', details: errResult }, 500);
        }

        const result = await cloudinaryRes.json();
        
        return c.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Upload error:', error);
        return c.json({ error: 'Internal Server Error', message: error.message }, 500);
    }
});

export default router;
