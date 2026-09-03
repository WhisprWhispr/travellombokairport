// Firestore REST Client for Cloudflare Workers / Pages Functions
// Uses Web Crypto API for RS256 signing of Google Service Account JWTs

function base64Url(data) {
    let base64;
    if (typeof data === "string") {
        base64 = btoa(data);
    } else {
        base64 = btoa(String.fromCharCode(...data));
    }
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToArrayBuffer(pem) {
    const pemContents = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s/g, ""); // Remove all newlines and spaces
    const binaryString = atob(pemContents);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function mapFromFirestoreValue(valueObj) {
    if (valueObj === undefined || valueObj === null) return null;
    const type = Object.keys(valueObj)[0];
    const val = valueObj[type];
    
    switch (type) {
        case 'stringValue':
            return val;
        case 'integerValue':
            return parseInt(val, 10);
        case 'doubleValue':
            return parseFloat(val);
        case 'booleanValue':
            return val;
        case 'nullValue':
            return null;
        case 'arrayValue':
            return (val.values || []).map(v => mapFromFirestoreValue(v));
        case 'mapValue':
            return mapFromFirestoreFields(val.fields || {});
        default:
            return val;
    }
}

function mapFromFirestoreFields(fields) {
    if (!fields) return {};
    const obj = {};
    for (const key in fields) {
        obj[key] = mapFromFirestoreValue(fields[key]);
    }
    return obj;
}

function mapToFirestoreValue(val) {
    if (val === null || val === undefined) {
        return { nullValue: null };
    }
    const type = typeof val;
    if (type === 'string') {
        return { stringValue: val };
    }
    if (type === 'boolean') {
        return { booleanValue: val };
    }
    if (type === 'number') {
        if (Number.isInteger(val)) {
            return { integerValue: val.toString() };
        }
        return { doubleValue: val };
    }
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(v => mapToFirestoreValue(v)) } };
    }
    if (type === 'object') {
        if (val instanceof Date) {
            return { stringValue: val.toISOString() };
        }
        return { mapValue: { fields: mapToFirestoreFields(val) } };
    }
    return { stringValue: String(val) };
}

function mapToFirestoreFields(obj) {
    const fields = {};
    for (const key in obj) {
        if (key === 'id') continue; 
        fields[key] = mapToFirestoreValue(obj[key]);
    }
    return fields;
}

class FirestoreCollection {
    constructor(client, colName) {
        this.client = client;
        this.colName = colName;
        this.filters = [];
        this.orders = [];
    }

    where(field, op, val) {
        let restOp = 'EQUAL';
        if (op === '==') restOp = 'EQUAL';
        else if (op === '>') restOp = 'GREATER_THAN';
        else if (op === '>=') restOp = 'GREATER_THAN_OR_EQUAL';
        else if (op === '<') restOp = 'LESS_THAN';
        else if (op === '<=') restOp = 'LESS_THAN_OR_EQUAL';

        this.filters.push({
            fieldFilter: {
                field: { fieldPath: field },
                op: restOp,
                value: mapToFirestoreValue(val)
            }
        });
        return this;
    }

    orderBy(field, direction = 'asc') {
        const dir = direction.toLowerCase() === 'desc' ? 'DESCENDING' : 'ASCENDING';
        this.orders.push({
            field: { fieldPath: field },
            direction: dir
        });
        return this;
    }

    async get() {
        if (this.filters.length > 0 || this.orders.length > 0) {
            const query = {
                from: [{ collectionId: this.colName }]
            };
            if (this.filters.length > 0) {
                if (this.filters.length === 1) {
                    query.where = this.filters[0];
                } else {
                    query.where = {
                        compositeFilter: {
                            op: 'AND',
                            filters: this.filters
                        }
                    };
                }
            }
            if (this.orders.length > 0) {
                query.orderBy = this.orders;
            }

            const results = await this.client.runQuery(query);
            const docs = results.map(doc => ({
                id: doc.id,
                data: () => doc,
                exists: true
            }));

            return {
                empty: docs.length === 0,
                docs: docs,
                forEach: (cb) => docs.forEach(cb)
            };
        } else {
            const docs = await this.client.listDocuments(this.colName);
            const mappedDocs = docs.map(doc => ({
                id: doc.id,
                data: () => doc,
                exists: true
            }));
            return {
                empty: mappedDocs.length === 0,
                docs: mappedDocs,
                forEach: (cb) => mappedDocs.forEach(cb)
            };
        }
    }

    async add(data) {
        const doc = await this.client.createDocument(this.colName, data);
        return {
            id: doc.id,
            ...doc
        };
    }

    doc(id) {
        return new FirestoreDocument(this.client, this.colName, id);
    }
}

class FirestoreDocument {
    constructor(client, colName, id) {
        this.client = client;
        this.colName = colName;
        this.id = id;
    }

    async get() {
        try {
            const data = await this.client.getDocument(this.colName, this.id);
            return {
                exists: true,
                id: this.id,
                data: () => data
            };
        } catch (err) {
            if (err.status === 404) {
                return {
                    exists: false,
                    id: this.id,
                    data: () => null
                };
            }
            throw err;
        }
    }

    async set(data) {
        return await this.client.setDocument(this.colName, this.id, data);
    }

    async update(data) {
        return await this.client.updateDocument(this.colName, this.id, data);
    }

    async delete() {
        return await this.client.deleteDocument(this.colName, this.id);
    }
}

class FirestoreClient {
    constructor(projectId, clientEmail, privateKey) {
        this.projectId = projectId;
        this.clientEmail = clientEmail;
        this.privateKey = privateKey;
        this.token = null;
        this.tokenExpiry = 0;
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    }

    async getAccessToken() {
        const now = Math.floor(Date.now() / 1000);
        if (this.token && now < this.tokenExpiry - 60) {
            return this.token;
        }

        const header = { alg: "RS256", typ: "JWT" };
        const payload = {
            iss: this.clientEmail,
            scope: "https://www.googleapis.com/auth/datastore",
            aud: "https://oauth2.googleapis.com/token",
            exp: now + 3600,
            iat: now
        };

        const privateKeyBuffer = pemToArrayBuffer(this.privateKey);
        const cryptoKey = await crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

        const stringToSign = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
        const encoder = new TextEncoder();
        const dataToSign = encoder.encode(stringToSign);
        const signatureArrayBuffer = await crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            cryptoKey,
            dataToSign
        );
        const signatureBase64Url = base64Url(new Uint8Array(signatureArrayBuffer));
        const jwt = `${stringToSign}.${signatureBase64Url}`;

        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: jwt
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to obtain Google access token: ${res.status} ${errText}`);
        }

        const tokenData = await res.json();
        this.token = tokenData.access_token;
        this.tokenExpiry = now + (tokenData.expires_in || 3600);
        return this.token;
    }

    async request(url, options = {}) {
        const token = await this.getAccessToken();
        const headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const err = new Error(`Firestore request failed: ${res.statusText}`);
            err.status = res.status;
            try {
                err.details = await res.json();
            } catch (_) {}
            throw err;
        }
        return res.json();
    }

    collection(colName) {
        return new FirestoreCollection(this, colName);
    }

    async listDocuments(colName) {
        try {
            const url = `${this.baseUrl}/${colName}`;
            const res = await this.request(url);
            if (!res.documents) return [];
            return res.documents.map(doc => {
                const id = doc.name.split('/').pop();
                return { id, ...mapFromFirestoreFields(doc.fields || {}) };
            });
        } catch (err) {
            if (err.status === 404) return [];
            throw err;
        }
    }

    async getDocument(colName, id) {
        const url = `${this.baseUrl}/${colName}/${id}`;
        const doc = await this.request(url);
        return { id, ...mapFromFirestoreFields(doc.fields || {}) };
    }

    async createDocument(colName, data) {
        const url = `${this.baseUrl}/${colName}`;
        const fields = mapToFirestoreFields(data);
        const doc = await this.request(url, {
            method: "POST",
            body: JSON.stringify({ fields })
        });
        const id = doc.name.split('/').pop();
        return { id, ...mapFromFirestoreFields(doc.fields || {}) };
    }

    async setDocument(colName, id, data) {
        // Firestore REST: PATCH untuk update, tapi PATCH gagal 404 jika dokumen belum ada.
        // Gunakan ?currentDocument.exists=false untuk create jika belum ada,
        // atau coba PATCH dulu lalu fallback ke create jika 404.
        const url = `${this.baseUrl}/${colName}/${id}`;
        const fields = mapToFirestoreFields(data);
        try {
            // Coba update/create langsung dengan PATCH (works if doc exists)
            const doc = await this.request(url, {
                method: "PATCH",
                body: JSON.stringify({ fields })
            });
            return { id, ...mapFromFirestoreFields(doc.fields || {}) };
        } catch (err) {
            if (err.status === 404) {
                // Dokumen belum ada — buat dengan PATCH + ?currentDocument.exists=false
                // Ini adalah "create-if-not-exists" di Firestore REST API
                const createUrl = `${url}?currentDocument.exists=false`;
                const doc = await this.request(createUrl, {
                    method: "PATCH",
                    body: JSON.stringify({ fields })
                });
                return { id, ...mapFromFirestoreFields(doc.fields || {}) };
            }
            throw err;
        }
    }

    async updateDocument(colName, id, data) {
        const url = `${this.baseUrl}/${colName}/${id}`;
        const fields = mapToFirestoreFields(data);
        
        const updateMaskParams = Object.keys(data)
            .filter(key => key !== 'id')
            .map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
            .join('&');
            
        const doc = await this.request(`${url}?${updateMaskParams}`, {
            method: "PATCH",
            body: JSON.stringify({ fields })
        });
        return { id, ...mapFromFirestoreFields(doc.fields || {}) };
    }

    async deleteDocument(colName, id) {
        const url = `${this.baseUrl}/${colName}/${id}`;
        await this.request(url, {
            method: "DELETE"
        });
        return { success: true };
    }

    async runQuery(structuredQuery) {
        const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents:runQuery`;
        const res = await this.request(url, {
            method: "POST",
            body: JSON.stringify({ structuredQuery })
        });
        
        const docs = [];
        if (Array.isArray(res)) {
            for (const item of res) {
                if (item.document) {
                    const doc = item.document;
                    const id = doc.name.split('/').pop();
                    docs.push({ id, ...mapFromFirestoreFields(doc.fields || {}) });
                }
            }
        }
        return docs;
    }
}

// Caching DB Client instance per worker instance
let dbInstance = null;

export function getDb(c) {
    if (dbInstance) return dbInstance;
    
    const serviceAccountStr = c.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable/secret on Cloudflare.");
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountStr);
        dbInstance = new FirestoreClient(
            serviceAccount.project_id,
            serviceAccount.client_email,
            serviceAccount.private_key
        );
        return dbInstance;
    } catch (e) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + e.message);
    }
}

export const admin = {
    firestore: {
        FieldValue: {
            serverTimestamp: () => new Date()
        }
    }
};
