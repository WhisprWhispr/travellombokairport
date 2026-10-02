import { Hono } from 'hono';

const cronRoutes = new Hono();

// Hardcoded API key from user
const CRON_API_KEY = 'Z95TGfE/d8rpa6QQmi++rzfavJl8UvR+6y6tp56rq9Y=';
const CRON_API_BASE = 'https://api.cron-job.org';

const getHeaders = () => ({
    'Authorization': `Bearer ${CRON_API_KEY}`,
    'Content-Type': 'application/json'
});

// GET /api/cron/jobs - List all cron jobs
cronRoutes.get('/jobs', async (c) => {
    try {
        const response = await fetch(`${CRON_API_BASE}/jobs`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// GET /api/cron/jobs/:id/history - Get job history
cronRoutes.get('/jobs/:id/history', async (c) => {
    try {
        const jobId = c.req.param('id');
        const response = await fetch(`${CRON_API_BASE}/jobs/${jobId}/history`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch job history: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

// PATCH /api/cron/jobs/:id - Enable/Disable or update a job
cronRoutes.patch('/jobs/:id', async (c) => {
    try {
        const jobId = c.req.param('id');
        const body = await c.req.json(); // { job: { enabled: true/false } }
        
        const response = await fetch(`${CRON_API_BASE}/jobs/${jobId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update job: ${response.status} ${response.statusText}`);
        }
        
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

export default cronRoutes;
