const fs = require('fs');
let js = fs.readFileSync('frontend/admin.js', 'utf8');

// Add showTab case
if (!js.includes("case 'blogs':")) {
    js = js.replace(/case 'promos':\s*document\.getElementById\('promos-section'\)\.style\.display = 'block';\s*document\.getElementById\('add-item-btn'\)\.style\.display = 'none';\s*const addPromoBtn = document\.getElementById\('add-promo-btn'\);\s*if\(addPromoBtn\) addPromoBtn\.style\.display = 'inline-block';\s*loadPromos\(\);\s*break;/,
`case 'promos':
            document.getElementById('promos-section').style.display = 'block';
            document.getElementById('add-item-btn').style.display = 'none';
            const addPromoBtn = document.getElementById('add-promo-btn');
            if(addPromoBtn) addPromoBtn.style.display = 'inline-block';
            loadPromos();
            break;
        case 'blogs':
            document.getElementById('blogs-section').style.display = 'block';
            document.getElementById('add-item-btn').style.display = 'none';
            const addBlogBtn = document.getElementById('add-blog-btn');
            if(addBlogBtn) addBlogBtn.style.display = 'inline-block';
            loadBlogs();
            break;`);
}

// Hide add-blog-btn in other sections
if (!js.includes("const addBlogBtn = document.getElementById('add-blog-btn');")) {
    js = js.replace(/const addPromoBtn = document\.getElementById\('add-promo-btn'\);\s*if \(addPromoBtn\) addPromoBtn\.style\.display = 'none';/g,
`const addPromoBtn = document.getElementById('add-promo-btn');
        if (addPromoBtn) addPromoBtn.style.display = 'none';
        const addBlogBtn = document.getElementById('add-blog-btn');
        if (addBlogBtn) addBlogBtn.style.display = 'none';`);
}

// Add add-blog-btn listener
if (!js.includes("document.getElementById('add-blog-btn').addEventListener('click'")) {
    js = js.replace(/if \(document\.getElementById\('add-promo-btn'\)\) \{\s*document\.getElementById\('add-promo-btn'\)\.addEventListener\('click', \(\) => openPromoModal\(\)\);\s*\}/,
`if (document.getElementById('add-promo-btn')) {
    document.getElementById('add-promo-btn').addEventListener('click', () => openPromoModal());
}
if (document.getElementById('add-blog-btn')) {
    document.getElementById('add-blog-btn').addEventListener('click', () => openBlogModal());
}`);
}

// Add Blogs Logic
if (!js.includes("async function loadBlogs()")) {
    js += `
// --- BLOGS LOGIC ---
let blogsData = [];
async function loadBlogs() {
    try {
        const res = await fetch(\`\${API_URL}/blogs?list=true\`);
        if (!res.ok) throw new Error('Failed to load blogs');
        blogsData = await res.json();
        renderBlogs();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal memuat artikel blog', 'error');
    }
}

function renderBlogs() {
    const tbody = document.getElementById('blogs-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = blogsData.map(b => {
        return \`
        <tr>
            <td><img src="\${b.coverImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'}" alt="\${b.title}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td style="font-weight: 600; color: var(--primary-blue);">\${b.title}</td>
            <td style="color: #64748b; font-size: 0.85rem;">/\${b.slug}</td>
            <td><span class="badge bg-secondary"><i class="fa-solid fa-eye"></i> \${b.views || 0}</span></td>
            <td>
                <button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="editBlog('\${b.id}')"><i class="fa-solid fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBlog('\${b.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        </tr>
        \`;
    }).join('');
}

window.openBlogModal = (blog = null) => {
    document.getElementById('blog-form').reset();
    if (blog) {
        document.getElementById('blog-modal-title').innerText = 'Edit Artikel Blog';
        document.getElementById('blog-id').value = blog.id;
        document.getElementById('blog-title').value = blog.title;
        document.getElementById('blog-summary').value = blog.summary;
        document.getElementById('blog-image').value = blog.coverImage || '';
        document.getElementById('blog-content').value = blog.content || '';
        document.getElementById('blog-tags').value = (blog.tags || []).join(', ');
    } else {
        document.getElementById('blog-modal-title').innerText = 'Tambah Artikel Blog';
        document.getElementById('blog-id').value = '';
    }
    document.getElementById('blog-modal').style.display = 'block';
};

window.closeBlogModal = () => {
    document.getElementById('blog-modal').style.display = 'none';
};

if (document.getElementById('blog-form')) {
    document.getElementById('blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id').value;
        const data = {
            title: document.getElementById('blog-title').value,
            summary: document.getElementById('blog-summary').value,
            coverImage: document.getElementById('blog-image').value,
            content: document.getElementById('blog-content').value,
            tags: document.getElementById('blog-tags').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? \`\${API_URL}/blogs/\${id}\` : \`\${API_URL}/blogs\`;
        
        // Show loading state
        Swal.fire({
            title: 'Menyimpan...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${localStorage.getItem('auth_token')}\`
                },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                Swal.fire('Sukses', \`Artikel berhasil \${id ? 'diperbarui' : 'ditambahkan'}\`, 'success');
                closeBlogModal();
                loadBlogs();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan artikel blog', 'error');
        }
    });
}

window.editBlog = async (id) => {
    // We need to fetch full blog data to get content
    try {
        Swal.fire({
            title: 'Memuat...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        const res = await fetch(\`\${API_URL}/blogs/\${id}\`);
        if (!res.ok) throw new Error('Not found');
        const blog = await res.json();
        
        Swal.close();
        openBlogModal(blog);
    } catch (e) {
        Swal.fire('Error', 'Gagal memuat data artikel', 'error');
    }
};

window.deleteBlog = async (id) => {
    const res = await Swal.fire({
        title: 'Hapus Artikel?',
        text: 'Tindakan ini tidak bisa dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, hapus!'
    });
    
    if (res.isConfirmed) {
        try {
            const req = await fetch(\`\${API_URL}/blogs/\${id}\`, {
                method: 'DELETE',
                headers: { 'Authorization': \`Bearer \${localStorage.getItem('auth_token')}\` }
            });
            if (req.ok) {
                Swal.fire('Terhapus!', 'Artikel telah dihapus.', 'success');
                loadBlogs();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menghapus artikel', 'error');
        }
    }
};
`;
}

fs.writeFileSync('frontend/admin.js', js);
console.log('done');
