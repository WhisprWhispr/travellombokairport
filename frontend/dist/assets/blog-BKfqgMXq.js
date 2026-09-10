import"./modulepreload-polyfill-P2Xu9kJm.js";import"./main-BxlTIgTZ.js";import"./pwa-DYmKx9RI.js";/* empty css              */var e=(window.location.hostname===`localhost`||window.location.hostname,`/api`);document.addEventListener(`DOMContentLoaded`,async()=>{let t=document.getElementById(`blog-container`);if(t)try{let n=await fetch(`${e}/blogs?list=true`);if(!n.ok)throw Error(`Failed to load blogs`);let r=await n.json();if(r.length===0){t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><p style="color: var(--text-gray);">Belum ada artikel saat ini.</p></div>`;return}let i=3,a=()=>{let e=r.slice(0,i);if(t.innerHTML=e.map(e=>{let t=e.createdAt?new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`}):``,n=e.coverImage&&e.coverImage.trim()!==``?e.coverImage:`https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600`;return`
                <a href="/article.html?id=${e.id}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); height: 100%; display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                         onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1)';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08)';">
                        
                        <div style="position: relative; height: 200px; width: 100%;">
                            <img src="${n}" alt="${e.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 15px; left: 15px; background: rgba(255, 255, 255, 0.95); color: var(--primary-green); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                                <i class="fa-solid fa-calendar"></i> ${t}
                            </div>
                        </div>
                        
                        <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 0.8rem; color: var(--primary-blue); font-weight: 600;"><i class="fa-solid fa-user"></i> ${e.author}</span>
                                <span style="font-size: 0.8rem; color: #64748b;"><i class="fa-solid fa-eye"></i> ${e.views||0}</span>
                            </div>
                            <h3 style="margin: 0 0 12px 0; font-size: 1.15rem; font-weight: 800; color: #0f172a; line-height: 1.4;">${e.title}</h3>
                            <p style="font-size: 0.9rem; color: #64748b; flex: 1; margin: 0 0 20px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${e.summary}</p>
                            
                            <div style="margin-top: auto; padding-top: 15px; border-top: 1px dashed #e2e8f0; text-align: right;">
                                <span style="color: var(--primary-blue); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: flex-end; gap: 5px; white-space: nowrap;">
                                    Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
                `}).join(``),i<r.length){let e=document.createElement(`div`);e.style.gridColumn=`1/-1`,e.style.textAlign=`center`,e.style.marginTop=`30px`,e.innerHTML=`<button id="load-more-btn" class="btn btn-green" style="padding: 10px 25px; border-radius: 30px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">Tampilkan Lebih Banyak</button>`,t.appendChild(e),document.getElementById(`load-more-btn`).addEventListener(`click`,()=>{i+=3,a()})}};a()}catch(e){console.error(e),t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><p style="color: #ef4444;">Gagal memuat artikel.</p></div>`}});