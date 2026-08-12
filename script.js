// ==========================================================================
// المحرك البرمجي الإمبراطوري المتكامل - رواية القبعة البيضاء (سجاد ثامر)
// ==========================================================================

'use strict';

const SamuraiAppEngine = {
    version: '4.3.0',
    author: 'سجاد ثامر',
    activeSeason: 1,
    totalSeasons: 6,
    episodesPerSeason: 9,
    unlockedEpisodesDownloadLimit: 2,
    storageKeys: {
        ratings: 'epic_samurai_ratings',
        theme: 'epic_samurai_theme',
        watched: 'epic_samurai_watched_episodes'
    },

    init() {
        this.restoreUserThemePreferences();
        this.preloadCinematicLoader();
        this.buildSamuraiSeasonsArchitecture();
    },

    preloadCinematicLoader() {
        setTimeout(() => {
            const loaderElement = document.getElementById('epicCinematicLoader');
            if (loaderElement) {
                loaderElement.style.opacity = '0';
                setTimeout(() => loaderElement.remove(), 750);
            }
        }, 1000);
    },

    restoreUserThemePreferences() {
        const savedTheme = localStorage.getItem(this.storageKeys.theme);
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode-active');
            const iconEl = document.getElementById('themeToggleIcon');
            if (iconEl) iconEl.innerText = '☀️';
        }
    },

    toggleThemeMode() {
        const bodyEl = document.body;
        bodyEl.classList.toggle('light-mode-active');
        const isLight = bodyEl.classList.contains('light-mode-active');
        localStorage.setItem(this.storageKeys.theme, isLight ? 'light' : 'dark');
        const iconEl = document.getElementById('themeToggleIcon');
        if (iconEl) iconEl.innerText = isLight ? '☀️' : '🌒';
    },

    executeExitProtocol() {
        if (confirm("هل أنت متأكد من رغبتك في إغلاق بوابات الملحمة والخروج؟")) {
            window.close();
        }
    },

    playKatanaSlashSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const audioCtx = new AudioContextClass();
            const oscillatorNode = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillatorNode.type = 'triangle';
            oscillatorNode.frequency.setValueAtTime(520, audioCtx.currentTime);
            oscillatorNode.frequency.exponentialRampToValueAtTime(65, audioCtx.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

            oscillatorNode.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillatorNode.start();
            oscillatorNode.stop(audioCtx.currentTime + 0.2);
        } catch (err) {}
    },

    switchView(targetViewId) {
        const allSections = document.querySelectorAll('.epic-view-section');
        allSections.forEach(sec => sec.classList.remove('active'));
        const targetSec = document.getElementById(targetViewId);
        if (targetSec) {
            targetSec.classList.add('active');
            const viewport = document.getElementById('epicViewportCanvas');
            if (viewport) viewport.scrollTop = 0;
        }
    },

    seasonNames: ["", "الأول (نصل الظل)", "الثاني (عهد الدم)", "الثالث", "الرابع", "الخامس", "السادس"],

    buildSamuraiSeasonsArchitecture() {
        const seasonsGridBox = document.getElementById('epicSeasonsGridContainer');
        if (!seasonsGridBox) return;
        seasonsGridBox.innerHTML = '';

        for (let i = 1; i <= this.totalSeasons; i++) {
            const seasonBox = document.createElement('div');
            if (i === 1) {
                seasonBox.className = 'epic-season-box unlocked';
                seasonBox.onclick = () => {
                    this.playKatanaSlashSound();
                    this.renderSeasonEpisodes(i);
                };
                seasonBox.innerHTML = `
                    <div class="season-num-big">0${i}</div>
                    <div class="season-name-txt">الموسم ${this.seasonNames[i].split(' ')[0]}</div>
                    <div class="season-status-pill">متاح</div>
                `;
            } else {
                seasonBox.className = 'epic-season-box locked';
                seasonBox.onclick = () => {
                    this.playKatanaSlashSound();
                    alert(`🔒 هذا الموسم مقفل بعهد الشرف.`);
                };
                seasonBox.innerHTML = `
                    <div class="season-num-big">🔒</div>
                    <div class="season-name-txt">الموسم ${this.seasonNames[i].split(' ')[0]}</div>
                    <div class="season-status-pill">مغلق بإحكام</div>
                `;
            }
            seasonsGridBox.appendChild(seasonBox);
        }
    },

    getWatchedEpisodes() {
        return JSON.parse(localStorage.getItem(this.storageKeys.watched) || '[]');
    },

    markEpisodeAsWatched(seasonNum, epNum) {
        const watchedList = this.getWatchedEpisodes();
        const epId = `s${seasonNum}_e${epNum}`;
        if (!watchedList.includes(epId)) {
            watchedList.push(epId);
            localStorage.setItem(this.storageKeys.watched, JSON.stringify(watchedList));
        }
        this.renderSeasonEpisodes(seasonNum);
    },

    updateCompletionProgress(seasonNum) {
        const watchedList = this.getWatchedEpisodes();
        const watchedInSeason = watchedList.filter(id => id.startsWith(`s${seasonNum}_`)).length;
        const percentage = Math.round((watchedInSeason / this.unlockedEpisodesDownloadLimit) * 100);
        
        const textEl = document.getElementById('seasonCompletionText');
        const barEl = document.getElementById('seasonCompletionBar');
        
        if(textEl) textEl.innerText = `${percentage}%`;
        if(barEl) barEl.style.width = `${percentage}%`;
    },

    renderSeasonEpisodes(seasonNum) {
        this.activeSeason = seasonNum;
        this.switchView('view-episodes');
        
        const titleEl = document.getElementById('epicActiveSeasonTitle');
        if (titleEl) titleEl.innerText = `الموسم ${this.seasonNames[seasonNum]}`;

        const episodesContainer = document.getElementById('epicEpisodesListContainer');
        if (!episodesContainer) return;
        episodesContainer.innerHTML = '';
        
        const watchedList = this.getWatchedEpisodes();

        for (let ep = 1; ep <= this.episodesPerSeason; ep++) {
            const rowEl = document.createElement('div');
            const epId = `s${seasonNum}_e${ep}`;
            const isWatched = watchedList.includes(epId);
            const watchedBadgeHTML = isWatched ? `<span class="watched-badge">✔️ تمت المشاهدة</span>` : '';

            if (ep <= this.unlockedEpisodesDownloadLimit) {
                rowEl.className = 'epic-episode-row';
                rowEl.innerHTML = `
                    <div class="episode-info-grp">
                        <h4 style="display:flex; align-items:center; flex-wrap:wrap; gap:5px;">الحلقة رقم ${ep} ${watchedBadgeHTML}</h4>
                    </div>
                    <button class="epic-download-btn" onclick="SamuraiAppEngine.handleEpisodeDownload(${seasonNum}, ${ep});">
                        ${isWatched ? 'إعادة التحميل' : '📥 تحميل / قراءة'}
                    </button>
                `;
            } else {
                rowEl.className = 'epic-episode-row locked';
                rowEl.innerHTML = `
                    <div class="episode-info-grp">
                        <h4>الحلقة رقم ${ep}</h4>
                    </div>
                    <div class="epic-locked-badge">🔒 مقفل</div>
                `;
            }
            episodesContainer.appendChild(rowEl);
        }
        this.updateCompletionProgress(seasonNum);
    },

    handleEpisodeDownload(seasonNum, epNum) {
        this.playKatanaSlashSound();
        this.markEpisodeAsWatched(seasonNum, epNum);
        
        const fileName = `s${seasonNum}_ep${epNum}.docx`;
        try {
            const anchor = document.createElement('a');
            anchor.href = fileName;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        } catch (err) {}
    },

    // دوال النوافذ المنبثقة والتقييم
    openModal(modalId) {
        this.playKatanaSlashSound();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            if (modalId === 'epicHonorModal') {
                this.renderRatingsStats();
            }
        }
    },

    closeModal(modalId) {
        this.playKatanaSlashSound();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    submitRating() {
        const nameInput = document.getElementById('epicRaterName');
        const scoreInput = document.getElementById('epicRaterScore');

        if (!nameInput || !scoreInput) return;

        const raterName = nameInput.value.trim();
        const raterScore = parseFloat(scoreInput.value);

        if (!raterName) {
            alert("عذراً، يجب إدخال اسمك أو لقبك الكريم أولاً.");
            return;
        }

        if (isNaN(raterScore) || raterScore < 0 || raterScore > 5) {
            alert("قيمة التقييم غير صالحة. يجب أن تكون حصراً بين 0 و 5.");
            return;
        }

        const ratingsList = JSON.parse(localStorage.getItem(this.storageKeys.ratings) || '[]');
        ratingsList.push({ name: raterName, score: raterScore });
        localStorage.setItem(this.storageKeys.ratings, JSON.stringify(ratingsList));

        nameInput.value = '';
        scoreInput.value = '';

        this.renderRatingsStats();
        alert(`أيها المحارب الباسل (${raterName})، تم توثيق تقييمك بنجاح!`);
    },

    renderRatingsStats() {
        const ratingsList = JSON.parse(localStorage.getItem(this.storageKeys.ratings) || '[]');
        const statsBox = document.getElementById('epicRatingStatsDisplay');
        if (!statsBox) return;

        if (ratingsList.length === 0) {
            statsBox.innerText = "لم يتم تسجيل أي تقييمات بعد.";
            return;
        }

        let sum = 0;
        ratingsList.forEach(item => sum += item.score);
        const avg = (sum / ratingsList.length).toFixed(1);
        statsBox.innerText = `⭐ متوسط التقييمات: ${avg} / 5 (عبر مشاركة ${ratingsList.length} محاربين)`;
    }
};

window.addEventListener('DOMContentLoaded', () => SamuraiAppEngine.init());

// الدوال العامة المربوطة بالأزرار
function playEpicKatanaSound() { SamuraiAppEngine.playKatanaSlashSound(); }
function switchEpicView(viewId) { SamuraiAppEngine.switchView(viewId); }
function toggleEpicThemeMode() { SamuraiAppEngine.toggleThemeMode(); }
function executeEpicExitProtocol() { SamuraiAppEngine.executeExitProtocol(); }
function openEpicHonorModal() { SamuraiAppEngine.openModal('epicHonorModal'); }
function closeEpicHonorModal() { SamuraiAppEngine.closeModal('epicHonorModal'); }
function openEpicAudioSettingsModal() { SamuraiAppEngine.openModal('epicAudioModal'); }
function closeEpicAudioSettingsModal() { SamuraiAppEngine.closeModal('epicAudioModal'); }
function submitEpicRating() { SamuraiAppEngine.submitRating(); }