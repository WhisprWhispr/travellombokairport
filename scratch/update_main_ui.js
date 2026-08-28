const fs = require('fs');

let mainJs = fs.readFileSync('frontend/main.js', 'utf8');

const oldRender = `window.renderPrayerTimes = (data) => {
    if(!document.getElementById('prayer-content')) return;

    document.getElementById('location-prompt').style.display = 'none';
    document.getElementById('prayer-loading').style.display = 'none';
    document.getElementById('prayer-content').style.display = 'block';

    document.getElementById('prayer-city').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + data.city;
    document.getElementById('prayer-date').textContent = data.date;

    const cardsContainer = document.getElementById('prayer-cards');
    cardsContainer.innerHTML = '';

    let nextPrayerName = '-';
    let nextPrayerTime = null;
    let prevPrayerTime = null;
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let lastMins = 0;
    for (const [name, timeStr] of Object.entries(data.timings)) {
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMins = h * 60 + m;
        
        let isNext = false;
        if (!nextPrayerTime && currentMins < prayerMins) {
            isNext = true;
            nextPrayerName = name;
            nextPrayerTime = new Date();
            nextPrayerTime.setHours(h, m, 0, 0);
            
            prevPrayerTime = new Date();
            if (lastMins === 0) {
                // assume subuh is first, so previous is isya yesterday
                prevPrayerTime.setDate(prevPrayerTime.getDate() - 1);
                prevPrayerTime.setHours(19, 30, 0, 0); // fallback
            } else {
                prevPrayerTime.setHours(Math.floor(lastMins/60), lastMins%60, 0, 0);
            }
        }
        lastMins = prayerMins;

        cardsContainer.innerHTML += \`
            <div style="background: rgba(255,255,255,0.05); padding: 15px 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid \${isNext ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.05)'}; transition: transform 0.3s, background 0.3s; transform: scale(\${isNext ? '1.02' : '1'}); background: \${isNext ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)'}; box-shadow: \${isNext ? '0 10px 25px -5px rgba(52,211,153,0.2)' : 'none'}">
                <div style="font-size: 1.1rem; color: \${isNext ? '#34d399' : '#e2e8f0'}; font-weight: \${isNext ? '700' : '500'};">\${name}</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: white;">\${timeStr}</div>
            </div>
        \`;
    }

    if (nextPrayerTime) {
        document.getElementById('next-prayer-name').textContent = nextPrayerName;
        
        if(window.prayerInterval) clearInterval(window.prayerInterval);
        
        const updateCountdown = () => {
            const nowTime = new Date();
            const t = nextPrayerTime - nowTime;
            
            // Progress Bar Logic
            if (prevPrayerTime) {
                const totalDuration = nextPrayerTime - prevPrayerTime;
                const elapsed = nowTime - prevPrayerTime;
                let percent = (elapsed / totalDuration) * 100;
                if (percent < 0) percent = 0;
                if (percent > 100) percent = 100;
                const pb = document.getElementById('prayer-progress');
                if (pb) pb.style.width = percent + '%';
            }

            if (t <= 0) {
                clearInterval(window.prayerInterval);
                document.getElementById('next-prayer-countdown').textContent = "00:00:00";
                setTimeout(() => window.requestPrayerLocation(true), 60000); // Reload after 1 min
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
};`

const regex = /window\.renderPrayerTimes = \(data\) => \{[\s\S]*?\};\n\n/;
mainJs = mainJs.replace(regex, oldRender + '\n\n');

fs.writeFileSync('frontend/main.js', mainJs);
console.log('Updated renderPrayerTimes in main.js');
