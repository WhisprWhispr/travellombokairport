const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('article-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;"><p style="color: #ef4444;">Artikel tidak ditemukan.</p></div>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/blogs/${id}`);
        if (!res.ok) throw new Error('Failed to load article');
        const blog = await res.json();
        
        // Update document title for SEO
        document.title = `${blog.title} - Travel Lombok`;
        
        const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '';
        const tagsHtml = (blog.tags || []).map(t => `<span style="background: #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; margin-right: 5px;">#${t}</span>`).join('');

        container.innerHTML = `
            <style>
                .article-cover { width: 100%; height: 250px; object-fit: cover; }
                @media(min-width: 768px) { .article-cover { height: 400px; } }
            </style>
            <div style="margin-bottom: 20px;">
                <a href="/blog.html" style="display: inline-flex; align-items: center; gap: 8px; color: var(--primary-blue); font-weight: 700; text-decoration: none; padding: 8px 16px; background: white; border-radius: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: all 0.3s ease;" onmouseover="this.style.transform='translateX(-5px)'; this.style.boxShadow='0 6px 15px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.05)';">
                    <i class="fa-solid fa-arrow-left"></i> Kembali ke Daftar Artikel
                </a>
            </div>
            <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.02);">
                <div style="position: relative; width: 100%;">
                    <img src="${blog.coverImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'}" alt="${blog.title}" class="article-cover">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
                </div>
                <div style="padding: 30px 20px;">
                    <h1 style="color: var(--primary-blue); font-size: 2rem; margin-bottom: 20px; font-weight: 800; line-height: 1.3;">${blog.title}</h1>
                    <div style="display: flex; gap: 15px; color: #64748b; font-size: 0.85rem; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px dashed #f1f5f9; flex-wrap: wrap;">
                        <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-user-circle" style="color: var(--primary-green);"></i> Ditulis oleh <strong style="color: var(--text-dark);">${blog.author}</strong></span>
                        <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-calendar-days" style="color: var(--primary-green);"></i> ${dateStr}</span>
                        <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-eye" style="color: var(--primary-green);"></i> ${blog.views || 0} kali dibaca</span>
                    </div>
                    <div class="article-content" style="line-height: 1.9; color: #334155; font-size: 1.05rem; min-height: 200px;">
                        ${(blog.content || '').split('\n').filter(p => p.trim() !== '').map(p => `<p style="margin-bottom: 1.5em; text-align: justify;">${p.trim()}</p>`).join('')}
                    </div>
                    ${tagsHtml ? `<div style="margin-top: 40px; padding-top: 25px; border-top: 2px dashed #f1f5f9; display: flex; gap: 8px; flex-wrap: wrap;">${tagsHtml}</div>` : ''}
                </div>
            </div>
        `;
        
        // Optional: Call an endpoint to increment view count
        try {
            // we didn't add a dedicated increment endpoint, but if we did, we'd call it here.
        } catch(e){}
        
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align: center; padding: 50px;"><p style="color: #ef4444;">Gagal memuat artikel.</p><a href="/blog.html" class="btn btn-outline" style="margin-top: 20px;">Kembali</a></div>';
    }
});
