const fs = require('fs');
const prayerCode = `

// --- PRAYER TIME LOGIC ---
window.requestPrayerLocation = (force = false) => {
    if (!force && localStorage.getItem('prayerData')) {
        renderPrayerTimes(JSON.parse(localStorage.getItem('prayerData')));
        return;
    }
    
    if (navigator.geolocation) {
        if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'none';
        if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'block';
        if(document.getElementById('prayer-content')) document.getElementById('prayer-content').style.display = 'none';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // method 11 (MUIS), tune +3 mins to all prayers as requested
                    const response = await fetch(\`https://api.aladhan.com/v1/timings?latitude=\${lat}&longitude=\${lng}&method=11&tune=3,3,3,3,3,3,3,3,3\`);
                    const data = await response.json();
                    
                    if (data && data.code === 200) {
                        const timings = data.data.timings;
                        
                        // Get city name using reverse geocoding (OpenStreetMap)
                        let cityName = 'Lokasi Anda';
                        try {
                            const geoRes = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
                            const geoData = await geoRes.json();
                            cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || cityName;
                        } catch(e) { console.error(e); }

                        const prayerData = {
                            city: cityName,
                            date: data.data.date.readable,
                            timings: {
                                Subuh: timings.Fajr,
                                Dzuhur: timings.Dhuhr,
                                Ashar: timings.Asr,
                                Maghrib: timings.Maghrib,
                                Isya: timings.Isha
                            },
                            timestamp: Date.now()
                        };

                        localStorage.setItem('prayerData', JSON.stringify(prayerData));
                        renderPrayerTimes(prayerData);
                    } else {
                        throw new Error('Gagal memuat jadwal sholat');
                    }
                } catch (error) {
                    console.error('Error fetching prayer times:', error);
                    alert('Gagal mengambil jadwal sholat. Silakan coba lagi.');
                    if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'block';
                    if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'none';
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'block';
                if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'none';
            }
        );
    } else {
        alert('Browser Anda tidak mendukung deteksi lokasi.');
    }
};

window.renderPrayerTimes = (data) => {
    if(!document.getElementById('prayer-content')) return;

    document.getElementById('location-prompt').style.display = 'none';
    document.getElementById('prayer-loading').style.display = 'none';
    document.getElementById('prayer-content').style.display = 'block';

    document.getElementById('prayer-city').textContent = data.city;
    document.getElementById('prayer-date').textContent = data.date;

    const cardsContainer = document.getElementById('prayer-cards');
    cardsContainer.innerHTML = '';

    let nextPrayerName = '-';
    let nextPrayerTime = null;
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const [name, timeStr] of Object.entries(data.timings)) {
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMins = h * 60 + m;
        
        let isNext = false;
        if (!nextPrayerTime && currentMins < prayerMins) {
            isNext = true;
            nextPrayerName = name;
            nextPrayerTime = new Date();
            nextPrayerTime.setHours(h, m, 0, 0);
        }

        cardsContainer.innerHTML += \`
            <div style="background: white; padding: 15px; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-left: 4px solid \${isNext ? 'var(--primary-green)' : 'var(--primary-blue)'}">
                <div style="font-size: 0.9rem; color: var(--text-gray); margin-bottom: 5px;">\${name}</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: var(--text-dark);">\${timeStr}</div>
            </div>
        \`;
    }

    if (nextPrayerTime) {
        document.getElementById('next-prayer-name').textContent = nextPrayerName;
        
        if(window.prayerInterval) clearInterval(window.prayerInterval);
        
        const updateCountdown = () => {
            const t = nextPrayerTime - new Date();
            if (t <= 0) {
                clearInterval(window.prayerInterval);
                document.getElementById('next-prayer-countdown').textContent = "00:00:00";
            } else {
                const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((t % (1000 * 60)) / 1000);
                document.getElementById('next-prayer-countdown').textContent = 
                    \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            }
        };
        updateCountdown();
        window.prayerInterval = setInterval(updateCountdown, 1000);
    } else {
        document.getElementById('next-prayer-name').textContent = "Besok";
        document.getElementById('next-prayer-countdown').textContent = "--:--:--";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('jadwal-sholat.html')) {
        window.requestPrayerLocation();
    }
});
`;

fs.appendFileSync('frontend/main.js', prayerCode);
console.log('Appended prayer logic to main.js');
