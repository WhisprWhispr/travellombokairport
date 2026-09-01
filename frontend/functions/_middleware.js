export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);

    // Skip middleware for static assets, api routes, and auth/admin pages
    const skipPaths = [
        '/api', '/assets', 
        '/maintenance', '/maintenance.html', 
        '/admin', '/admin.html', 
        '/login', '/login.html', 
        '/register', '/register.html',
        '/driver', '/driver.html',
        '/reset-sandi', '/reset-sandi.html'
    ];
    
    // Check extensions
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|xml|json)$/i)) {
        return next();
    }

    // Check paths
    if (skipPaths.some(p => url.pathname.startsWith(p) || url.pathname === p)) {
        return next();
    }

    try {
        // Fetch settings from our API
        const apiUrl = new URL('/api/settings', request.url);
        
        // We set a short timeout so we don't block the request forever if Firestore is slow
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(apiUrl.toString(), { 
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.maintenanceMode === true) {
                return Response.redirect(new URL('/maintenance.html', request.url), 302);
            }
        }
    } catch (e) {
        // If API fails or times out, fail open (allow users to see the site)
        console.error("Middleware maintenance check failed:", e);
    }

    // Continue to normal page
    return next();
}
