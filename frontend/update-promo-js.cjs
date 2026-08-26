const fs = require('fs');
let js = fs.readFileSync('frontend/admin.js', 'utf8');

// 1. Fix showTab hiding
if (!js.includes('const promosSection = document.getElementById("promos-section");')) {
    js = js.replace(/const reviewsSection = document\.getElementById\("reviews-section"\);\s*if \(reviewsSection\) reviewsSection\.style\.display = "none";/, 
`const reviewsSection = document.getElementById("reviews-section");
      if (reviewsSection) reviewsSection.style.display = "none";
      const promosSection = document.getElementById("promos-section");
      if (promosSection) promosSection.style.display = "none";
      const blogsSection = document.getElementById("blogs-section");
      if (blogsSection) blogsSection.style.display = "none";`);
}

// Hide buttons
if (!js.includes('const addPromoBtn = document.getElementById("add-promo-btn");')) {
    js = js.replace(/document\.getElementById\("add-driver-btn"\)\.style\.display = "none";/,
`document.getElementById("add-driver-btn").style.display = "none";
      const addPromoBtn = document.getElementById("add-promo-btn");
      if (addPromoBtn) addPromoBtn.style.display = "none";
      const addBlogBtn = document.getElementById("add-blog-btn");
      if (addBlogBtn) addBlogBtn.style.display = "none";`);
}

// 2. Add to showTab if/else
if (!js.includes('tab === "promos"')) {
    js = js.replace(/\} else if \(tab === "withdrawals"\) \{/, 
`} else if (tab === "promos") {
          const promosSection = document.getElementById("promos-section");
          if (promosSection) promosSection.style.display = "block";
          const addPromoBtn = document.getElementById("add-promo-btn");
          if (addPromoBtn) addPromoBtn.style.display = "inline-block";
          if (typeof loadPromos === 'function') loadPromos();
      } else if (tab === "blogs") {
          const blogsSection = document.getElementById("blogs-section");
          if (blogsSection) blogsSection.style.display = "block";
          const addBlogBtn = document.getElementById("add-blog-btn");
          if (addBlogBtn) addBlogBtn.style.display = "inline-block";
          if (typeof loadBlogs === 'function') loadBlogs();
      } else if (tab === "withdrawals") {`);
}

// 3. Update Promo Logic
// In renderPromos, add item name
js = js.replace(/<td style="font-weight: bold; color: var\(--primary-blue\);">(.*?)<\/td>/,
    `<td style="font-weight: bold; color: var(--primary-blue);">$1<br><span style="font-size:0.75rem; color:#64748b; font-weight:normal;">\${p.itemId ? 'Item Khusus' : 'Semua Paket'}</span></td>`);

// In openPromoModal, populate dropdown
js = js.replace(/document\.getElementById\('promo-id'\)\.value = promo\.id;/,
    `document.getElementById('promo-id').value = promo.id;
        document.getElementById('promo-item').value = promo.itemId || '';`);
js = js.replace(/document\.getElementById\('promo-id'\)\.value = '';/,
    `document.getElementById('promo-id').value = '';
        document.getElementById('promo-item').value = '';`);

// Populate promo-item dropdown when opening modal
if (!js.includes("function populatePromoItems()")) {
    js = js.replace(/window\.openPromoModal = \(promo = null\) => \{/, 
`function populatePromoItems() {
    const sel = document.getElementById('promo-item');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Semua Paket --</option>';
    if (window.globalItems) {
        window.globalItems.forEach(item => {
            sel.innerHTML += \`<option value="\${item.id}">\${item.title}</option>\`;
        });
    }
    sel.value = currentVal;
}

window.openPromoModal = (promo = null) => {
    populatePromoItems();`);
}

// Update payload
js = js.replace(/isActive: document\.getElementById\('promo-active'\)\.value === 'true'/,
    `isActive: document.getElementById('promo-active').value === 'true',
            itemId: document.getElementById('promo-item').value || null`);


// Fix any remaining \${ (if we accidentally double escaped again)
js = js.replace(/\\\`/g, '`');
js = js.replace(/\\\$/g, '$');

fs.writeFileSync('frontend/admin.js', js);
console.log('fixed admin.js logic');
