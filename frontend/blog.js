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

        let displayCount = 3;

        const renderBlogs = () => {
            const currentBlogs = blogs.slice(0, displayCount);
            container.innerHTML = currentBlogs.map(b => {
                const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
                const imgUrl = (b.coverImage && b.coverImage.trim() !== '') ? b.coverImage : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600';
                
                return `
                <a href="/article.html?id=${b.id}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); height: 100%; display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                         onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1)';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08)';">
                        
                        <div style="position: relative; height: 200px; width: 100%;">
                            <img src="${imgUrl}" alt="${b.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 15px; left: 15px; background: rgba(255, 255, 255, 0.95); color: var(--primary-green); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                                <i class="fa-solid fa-calendar"></i> ${dateStr}
                            </div>
                        </div>
                        
                        <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 0.8rem; color: var(--primary-blue); font-weight: 600;"><i class="fa-solid fa-user"></i> ${b.author}</span>
                                <span style="font-size: 0.8rem; color: #64748b;"><i class="fa-solid fa-eye"></i> ${b.views || 0}</span>
                            </div>
                            <h3 style="margin: 0 0 12px 0; font-size: 1.15rem; font-weight: 800; color: #0f172a; line-height: 1.4;">${b.title}</h3>
                            <p style="font-size: 0.9rem; color: #64748b; flex: 1; margin: 0 0 20px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${b.summary}</p>
                            
                            <div style="margin-top: auto; padding-top: 15px; border-top: 1px dashed #e2e8f0; text-align: right;">
                                <span style="color: var(--primary-blue); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                                    Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
                `;
            }).join('');
            
            if (displayCount < blogs.length) {
                const btnWrapper = document.createElement('div');
                btnWrapper.style.gridColumn = '1/-1';
                btnWrapper.style.textAlign = 'center';
                btnWrapper.style.marginTop = '30px';
                btnWrapper.innerHTML = '<button id="load-more-btn" class="btn btn-green" style="padding: 10px 25px; border-radius: 30px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">Tampilkan Lebih Banyak</button>';
                container.appendChild(btnWrapper);
                
                document.getElementById('load-more-btn').addEventListener('click', () => {
                    displayCount += 3;
                    renderBlogs();
                });
            }
        };

        renderBlogs();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><p style="color: #ef4444;">Gagal memuat artikel.</p></div>';
    }
});
