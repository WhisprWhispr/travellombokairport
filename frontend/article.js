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
            <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="position: relative; width: 100%; height: 350px;">
                    <img src="${blog.coverImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'}" alt="${blog.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 40px;">
                    <h1 style="color: var(--primary-blue); font-size: 2.2rem; margin-bottom: 15px;">${blog.title}</h1>
                    <div style="display: flex; gap: 20px; color: #64748b; font-size: 0.9rem; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <span><i class="fa-solid fa-user"></i> Oleh <strong>${blog.author}</strong></span>
                        <span><i class="fa-solid fa-calendar"></i> ${dateStr}</span>
                        <span><i class="fa-solid fa-eye"></i> ${blog.views || 0} kali dilihat</span>
                    </div>
                    <div class="article-content" style="line-height: 1.8; color: var(--text-dark); font-size: 1.05rem;">
                        ${blog.content}
                    </div>
                    ${tagsHtml ? `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">${tagsHtml}</div>` : ''}
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="/blog.html" class="btn btn-outline" style="padding: 10px 25px;"><i class="fa-solid fa-arrow-left"></i> Kembali ke Blog</a>
                    </div>
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
