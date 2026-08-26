const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('blog-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/blogs?list=true`);
        if (!res.ok) throw new Error('Failed to load blogs');
        const blogs = await res.json();
        
        if (blogs.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><p style="color: var(--text-gray);">Belum ada artikel saat ini.</p></div>';
            return;
        }

        container.innerHTML = blogs.map(b => {
            const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
            return `
            <a href="/article.html?id=${b.id}" style="text-decoration: none; color: inherit;">
                <div class="package-card" style="height: 100%; display: flex; flex-direction: column;">
                    <div class="package-image">
                        <img src="${b.coverImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'}" alt="${b.title}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
                        <div class="package-badge"><i class="fa-solid fa-calendar"></i> ${dateStr}</div>
                    </div>
                    <div class="package-info" style="flex: 1; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 0.8rem; color: var(--primary-blue); font-weight: 600;"><i class="fa-solid fa-user"></i> ${b.author}</span>
                            <span style="font-size: 0.8rem; color: #64748b;"><i class="fa-solid fa-eye"></i> ${b.views || 0}</span>
                        </div>
                        <h3 class="package-title" style="margin-bottom: 10px; font-size: 1.2rem;">${b.title}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-gray); flex: 1; margin-bottom: 20px;">${b.summary}</p>
                        <div style="text-align: right; margin-top: auto;">
                            <span style="color: var(--primary-blue); font-weight: 600; font-size: 0.9rem;">Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </div>
                </div>
            </a>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><p style="color: #ef4444;">Gagal memuat artikel.</p></div>';
    }
});
