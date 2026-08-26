const fs = require('fs');
let js = fs.readFileSync('frontend/admin.js', 'utf8');

// Add showTab case
if (!js.includes("case 'promos':")) {
    js = js.replace(/case 'reviews':\s*document\.getElementById\('reviews-section'\)\.style\.display = 'block';\s*document\.getElementById\('add-item-btn'\)\.style\.display = 'none';\s*loadReviews\(\);\s*break;/,
`case 'reviews':
            document.getElementById('reviews-section').style.display = 'block';
            document.getElementById('add-item-btn').style.display = 'none';
            loadReviews();
            break;
        case 'promos':
            document.getElementById('promos-section').style.display = 'block';
            document.getElementById('add-item-btn').style.display = 'none';
            const addPromoBtn = document.getElementById('add-promo-btn');
            if(addPromoBtn) addPromoBtn.style.display = 'inline-block';
            loadPromos();
            break;`);
}

// Ensure addPromoBtn is hidden in other tabs
if (!js.includes("document.getElementById('add-promo-btn').style.display = 'none';")) {
    js = js.replace(/const addDriverBtn = document\.getElementById\('add-driver-btn'\);\s*if \(addDriverBtn\) addDriverBtn\.style\.display = 'none';/g,
`const addDriverBtn = document.getElementById('add-driver-btn');
        if (addDriverBtn) addDriverBtn.style.display = 'none';
        const addPromoBtn = document.getElementById('add-promo-btn');
        if (addPromoBtn) addPromoBtn.style.display = 'none';`);
}

// Add addPromoBtn event listener
if (!js.includes("document.getElementById('add-promo-btn').addEventListener('click'")) {
    js = js.replace(/if \(document\.getElementById\('add-driver-btn'\)\) \{\s*document\.getElementById\('add-driver-btn'\)\.addEventListener\('click', \(\) => openDriverModal\(\)\);\s*\}/,
`if (document.getElementById('add-driver-btn')) {
    document.getElementById('add-driver-btn').addEventListener('click', () => openDriverModal());
}
if (document.getElementById('add-promo-btn')) {
    document.getElementById('add-promo-btn').addEventListener('click', () => openPromoModal());
}`);
}

// Add logic
if (!js.includes("async function loadPromos()")) {
    js += `
// --- PROMOS LOGIC ---
let promosData = [];
async function loadPromos() {
    try {
        const res = await fetch(\`\${API_URL}/promos\`, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('auth_token')}\` } });
        if (!res.ok) throw new Error('Failed to load promos');
        promosData = await res.json();
        renderPromos();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal memuat promo', 'error');
    }
}

function renderPromos() {
    const tbody = document.getElementById('promos-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = promosData.map(p => {
        const discountStr = p.discountType === 'percent' ? \`\${p.discountValue}% \${p.maxDiscount ? '(Max: Rp ' + p.maxDiscount.toLocaleString('id-ID') + ')' : ''}\` : \`Rp \${p.discountValue.toLocaleString('id-ID')}\`;
        const validStr = p.validUntil ? new Date(p.validUntil).toLocaleDateString('id-ID') : 'Tanpa Batas';
        const statusBadge = p.isActive ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-secondary">Tidak Aktif</span>';
        
        return \`
        <tr>
            <td style="font-weight: bold; color: var(--primary-blue);">\${p.code}</td>
            <td>\${discountStr}</td>
            <td>\${validStr}</td>
            <td>\${statusBadge}</td>
            <td>
                <button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="editPromo('\${p.id}')"><i class="fa-solid fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePromo('\${p.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        </tr>
        \`;
    }).join('');
}

window.openPromoModal = (promo = null) => {
    document.getElementById('promo-form').reset();
    if (promo) {
        document.getElementById('promo-modal-title').innerText = 'Edit Promo';
        document.getElementById('promo-id').value = promo.id;
        document.getElementById('promo-code').value = promo.code;
        document.getElementById('promo-type').value = promo.discountType;
        document.getElementById('promo-value').value = promo.discountValue;
        document.getElementById('promo-max').value = promo.maxDiscount || '';
        document.getElementById('promo-valid').value = promo.validUntil || '';
        document.getElementById('promo-active').checked = promo.isActive;
    } else {
        document.getElementById('promo-modal-title').innerText = 'Tambah Promo';
        document.getElementById('promo-id').value = '';
    }
    document.getElementById('promo-modal').style.display = 'block';
};

window.closePromoModal = () => {
    document.getElementById('promo-modal').style.display = 'none';
};

if (document.getElementById('promo-form')) {
    document.getElementById('promo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('promo-id').value;
        const data = {
            code: document.getElementById('promo-code').value,
            discountType: document.getElementById('promo-type').value,
            discountValue: Number(document.getElementById('promo-value').value),
            maxDiscount: document.getElementById('promo-max').value ? Number(document.getElementById('promo-max').value) : null,
            validUntil: document.getElementById('promo-valid').value || null,
            isActive: document.getElementById('promo-active').checked
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? \`\${API_URL}/promos/\${id}\` : \`\${API_URL}/promos\`;
        
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
                Swal.fire('Sukses', \`Promo berhasil \${id ? 'diperbarui' : 'ditambahkan'}\`, 'success');
                closePromoModal();
                loadPromos();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan promo', 'error');
        }
    });
}

window.editPromo = (id) => {
    const promo = promosData.find(p => p.id === id);
    if (promo) openPromoModal(promo);
};

window.deletePromo = async (id) => {
    const res = await Swal.fire({
        title: 'Hapus Promo?',
        text: 'Tindakan ini tidak bisa dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, hapus!'
    });
    
    if (res.isConfirmed) {
        try {
            const req = await fetch(\`\${API_URL}/promos/\${id}\`, {
                method: 'DELETE',
                headers: { 'Authorization': \`Bearer \${localStorage.getItem('auth_token')}\` }
            });
            if (req.ok) {
                Swal.fire('Terhapus!', 'Promo telah dihapus.', 'success');
                loadPromos();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menghapus promo', 'error');
        }
    }
};
`;
}

fs.writeFileSync('frontend/admin.js', js);
console.log('done');
