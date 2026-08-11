// مصفوفة بأسماء المواسم الثمانية
const seasons = [
    "الموسم الأول", "الموسم الثاني", "الموسم الثالث", "الموسم الرابع",
    "الموسم الخامس", "الموسم السادس", "الموسم السابع", "الموسم الثامن"
];

function initSeasons() {
    let container = document.getElementById('seasons-container');
    if (!container) return;
    container.innerHTML = '';

    seasons.forEach((season, index) => {
        let seasonNum = index + 1;
        let item = document.createElement('div');
        item.className = 'timeline-item';
        
        // الموسم الأول فقط متاح، وباقي المواسم (من 2 إلى 8) قريباً
        if (seasonNum === 1) {
            item.onclick = function() { openEpisodes(seasonNum, season); };
            item.innerHTML = `
                <div class="timeline-content">
                    <h3>${season}</h3>
                    <p style="color: #27ae60;">متاح</p>
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
    let seasonsScreen = document.getElementById('seasons-screen');
    let episodesScreen = document.getElementById('episodes-screen');
    
    if (seasonsScreen) seasonsScreen.classList.remove('active');
    if (episodesScreen) episodesScreen.classList.add('active');
    
    let seasonTitle = document.getElementById('season-title');
    if (seasonTitle) seasonTitle.innerText = seasonName;
    
    let container = document.getElementById('episodes-container');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
        let row = document.createElement('div');
        row.className = 'list-row';
        
        let fileName = `s${seasonNum}_ep${i}.docx`;
        
        // بالموسم الأول: نخلي الحلقة الأولى فقط متاحة للتحميل، وباقي الحلقات (من 2 إلى 24) قريباً
        if (seasonNum === 1 && i === 1) {
            row.innerHTML = `
                <h3>الحلقة ${i}</h3>
                <a href="${fileName}" download class="download-btn" onclick="checkWordApp(event, '${fileName}')">تحميل الحلقة</a>
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

// دالة التحقق والتنبيه لتطبيق الوورد
function checkWordApp(event, fileName) {
    let hasWord = confirm("هذا الملف بصيغة Word (.docx).\nهل لديك تطبيق Microsoft Word أو برنامج عارض للوورد مثبت على جهازك؟\n\nاضغط 'موافق' للتحميل، أو 'إلغاء' لتوجيهك لتحميل التطبيق.");
    
    if (!hasWord) {
        event.preventDefault(); // يمنع التحميل المؤقت
        alert("يرجى تحميل تطبيق Microsoft Word من متجر التطبيقات لكي تتمكن من قراءة الرواية!");
        window.location.href = "https://play.google.com/store/apps/details?id=com.microsoft.office.word";
    }
}

// دالة العودة للمواسم
function goBackToSeasons() {
    let episodesScreen = document.getElementById('episodes-screen');
    let seasonsScreen = document.getElementById('seasons-screen');
    
    if (episodesScreen) episodesScreen.classList.remove('active');
    if (seasonsScreen) seasonsScreen.classList.add('active');
}

window.onload = function() {
    initSeasons();
};