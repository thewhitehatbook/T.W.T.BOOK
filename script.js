// مصفوفة بأسماء المواسم الثمانية
const seasons = [
    "الموسم الأول", "الموسم الثاني", "الموسم الثالث", "الموسم الرابع",
    "الموسم الخامس", "الموسم السادس", "الموسم السابع", "الموسم الثامن"
];

function initSeasons() {
    let container = document.getElementById('seasons-container');
    container.innerHTML = '';

    seasons.forEach((season, index) => {
        let seasonNum = index + 1;
        let item = document.createElement('div');
        item.className = 'timeline-item';
        
        // كمثال: نفترض الموسم الأول متاح، وباقي المواسم "قريباً"
        // (تقدر تغير الشرط حسب الحلقات أو المواسم المتوفرة عندك)
        if (seasonNum === 1) {
            item.onclick = function() { openEpisodes(seasonNum, season); };
            item.innerHTML = `
                <div class="timeline-content">
                    <h3>${season}</h3>
                    <p>متاح</p>
                </div>
            `;
        } else {
            item.onclick = function() { showComingSoon(season); };
            item.innerHTML = `
                <div class="timeline-content" style="opacity: 0.8;">
                    <h3>${season}</h3>
                    <p style="color: #e74c3c;">قريباً</p>
                </div>
            `;
        }
        
        container.appendChild(item);
    });
}

// دالة إشعار للمواسم التي ستتوفر قريباً
function showComingSoon(seasonName) {
    alert(seasonName + " سيتم إطلاقه قريباً، انتظرونا!");
}

// دالة فتح الحلقات للموسم المتاح
function openEpisodes(seasonNum, seasonName) {
    document.getElementById('seasons-screen').classList.remove('active');
    document.getElementById('episodes-screen').classList.add('active');
    
    document.getElementById('season-title').innerText = seasonName;
    
    let container = document.getElementById('episodes-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= 24; i++) {
        let row = document.createElement('div');
        row.className = 'list-row';
        
        let fileName = `s${seasonNum}_ep${i}.docx`;
        
        // كمثال: نفرض أول 5 حلقات من الموسم الأول متاحة، والباقي "قريباً"
        if (seasonNum === 1 && i <= 1) {
            row.innerHTML = `
                <h3>الحلقة ${i}</h3>
                <a href="${fileName}" download class="download-btn">تحميل الحلقة</a>
            `;
        } else {
            row.innerHTML = `
                <h3>الحلقة ${i}</h3>
                <button onclick="alert('الحلقة ${i} من ${seasonName} ستأتي قريباً!')" class="download-btn" style="background: #ccc; border-color: #999; cursor: pointer;">قريباً</button>
            `;
        }
        
        container.appendChild(row);
    }
}

// دالة العودة للمواسم
function goBackToSeasons() {
    document.getElementById('episodes-screen').classList.remove('active');
    document.getElementById('seasons-screen').classList.add('active');
}

window.onload = function() {
    initSeasons();
};