const seasons = [
    "الموسم الأول", "الموسم الثاني", "الموسم الثالث", 
    "الموسم الرابع", "الموسم الخامس", "الموسم السادس"
];

// التنقل بين الشاشات
function goToSeasons() {
    switchScreen('seasons-screen');
    initSeasons();
}

function goHome() {
    switchScreen('home-screen');
    updateRatingBadge();
    updateProgress();
}

function goBackToSeasons() {
    switchScreen('seasons-screen');
}

function showAbout() {
    switchScreen('about-screen');
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// تبديل الوضع الداكن والفاتح
function toggleTheme() {
    let body = document.getElementById('body-theme');
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');
    let themeName = body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('app_theme', themeName);
}

// زر الخروج من التطبيق
function exitApp() {
    if (confirm("هل تريد حقاً إغلاق التطبيق؟")) {
        window.close();
        // إذا المتصفح منع الإغلاق التلقائي، نعرض رسالة ودية
        alert("شكراً لاستخدامك تطبيق رواية القبعة البيضاء. يمكنك إغلاق الصفحة الآن.");
    }
}

// توليد المواسم
function initSeasons() {
    let container = document.getElementById('seasons-container');
    container.innerHTML = '';

    seasons.forEach((season, index) => {
        let seasonNum = index + 1;
        let row = document.createElement('div');
        row.className = 'list-row';
        
        if (seasonNum === 1) {
            row.innerHTML = `
                <h3>${season}</h3>
                <button class="action-btn" onclick="openEpisodes(${seasonNum}, '${season}')">فتح</button>
            `;
        } else {
            row.innerHTML = `
                <h3>${season}</h3>
                <button class="action-btn coming-btn" onclick="alert('${season} سيتم إطلاقه قريباً!')">قريباً</button>
            `;
        }
        container.appendChild(row);
    });
}

// عرض الحلقات مع حالة المشاهدة
function openEpisodes(seasonNum, seasonName) {
    switchScreen('episodes-screen');
    document.getElementById('season-title').innerText = seasonName;
    document.getElementById('search-input').value = '';
    
    renderEpisodesList(seasonNum, seasonName);
}

function renderEpisodesList(seasonNum, seasonName, filterText = '') {
    let container = document.getElementById('episodes-container');
    container.innerHTML = '';
    
    let watchedEpisodes = JSON.parse(localStorage.getItem(`watched_s${seasonNum}`) || '[]');
    
    for (let i = 1; i <= 9; i++) {
        let epName = `الحلقة ${i}`;
        if (filterText && !epName.includes(filterText)) continue;

        let row = document.createElement('div');
        row.className = 'list-row';
        let fileName = `s${seasonNum}_ep${i}.docx`;
        let isWatched = watchedEpisodes.includes(i);
        let watchedLabel = isWatched ? '<span style="color: #27ae60; font-size: 0.75rem; display: block;">✓ تمت المشاهدة</span>' : '';
        
        if (seasonNum === 1 && (i === 1 || i === 2)) {
            row.innerHTML = `
                <div>
                    <h3>${epName}</h3>
                    ${watchedLabel}
                </div>
                <a href="${fileName}" download class="action-btn" onclick="markAsWatched(${seasonNum}, ${i})">تحميل</a>
            `;
        } else {
            row.innerHTML = `
                <div>
                    <h3>${epName}</h3>
                    ${watchedLabel}
                </div>
                <button class="action-btn coming-btn" onclick="alert('${epName} من ${seasonName} ستتوفر قريباً!')">قريباً</button>
            `;
        }
        container.appendChild(row);
    }
}

// محرك البحث الفوري
function filterEpisodes() {
    let query = document.getElementById('search-input').value;
    renderEpisodesList(1, 'الموسم الأول', query);
}

function markAsWatched(seasonNum, epNum) {
    let key = `watched_s${seasonNum}`;
    let watchedEpisodes = JSON.parse(localStorage.getItem(key) || '[]');
    if (!watchedEpisodes.includes(epNum)) {
        watchedEpisodes.push(epNum);
        localStorage.setItem(key, JSON.stringify(watchedEpisodes));
    }
    updateProgress();
}

// حساب نسبة إنجاز قراءة الحلقات المتاحة للتطبيق
function updateProgress() {
    let watched1 = JSON.parse(localStorage.getItem('watched_s1') || '[]');
    let totalAvailable = 2; 
    let count = watched1.filter(ep => ep === 1 || ep === 2).length;
    let percentage = Math.round((count / totalAvailable) * 100);
    
    let fill = document.getElementById('progress-fill');
    let text = document.getElementById('progress-text');
    if (fill && text) {
        fill.style.width = percentage + '%';
        text.innerText = percentage + '%';
    }
}

// نظام التقييم الذكي ومتوسط النجوم
function rateStory() {
    let userName = prompt("أهلاً بك! أرجو كتابة اسمك أو معرفك:");
    if (!userName || userName.trim() === "") return;

    let ratingInput = prompt("مرحباً " + userName + "! ما هو تقييمك للرواية من 0 إلى 5 نجوم؟");
    if (ratingInput === null || ratingInput === "") return;

    let rating = parseFloat(ratingInput);
    if (isNaN(rating) || rating < 0 || rating > 5) {
        alert("يرجى إدخال رقم صحيح بين 0 و 5.");
        return;
    }

    let ratingsList = JSON.parse(localStorage.getItem('story_ratings') || '[]');
    ratingsList.push({ name: userName, score: rating });
    localStorage.setItem('story_ratings', JSON.stringify(ratingsList));

    updateRatingBadge();
    
    let totalScore = 0;
    ratingsList.forEach(item => totalScore += item.score);
    let averageRating = (totalScore / ratingsList.length).toFixed(1);

    alert("شكراً لك يا " + userName + "! تم تسجيل تقييمك بنجاح.\n⭐ التقييم العام: " + averageRating + " من 5 (" + ratingsList.length + " مقيمين)");
}

function updateRatingBadge() {
    let ratingsList = JSON.parse(localStorage.getItem('story_ratings') || '[]');
    let badge = document.getElementById('rating-badge');
    if (ratingsList.length > 0) {
        let totalScore = 0;
        ratingsList.forEach(item => totalScore += item.score);
        let avg = (totalScore / ratingsList.length).toFixed(1);
        badge.innerText = `⭐ ${avg}`;
    } else {
        badge.innerText = "تقييم";
    }
}

// تحميل الإعدادات المحفوظة مسبقاً عند فتح التطبيق
window.onload = function() {
    updateRatingBadge();
    updateProgress();

    let savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
        document.getElementById('body-theme').classList.remove('dark-mode');
        document.getElementById('body-theme').classList.add('light-mode');
    }
};