// ==========================================================================
// المحرك البرمجي الإمبراطوري المتكامل - رواية القبعة البيضاء (سجاد ثامر)
// ==========================================================================

'use strict';

const SamuraiAppEngine = {
    version: '4.3.1',
    author: 'سجاد ثامر',
    activeSeason: 1,
    totalSeasons: 6,
    episodesPerSeason: 9,
    unlockedEpisodesDownloadLimit: 4, 
    
    audioConfig: {
        bgMusicPath: 'itachi.mp3',
        clickSoundPath: 'as.mp3', 
        bgVolume: 0.4, 
        clickVolume: 0.6 
    },
    bgAudioInstance: null,
    currentSectionAudio: null, 
    sectionAudioInstances: {},
    isUserMuted: false, // متغير لتتبع إذا كان المستخدم كتم الصوت بنفسه

    storageKeys: {
        ratings: 'epic_samurai_ratings',
        theme: 'epic_samurai_theme',
        watched: 'epic_samurai_watched_episodes'
    },

    init() {
        this.restoreUserThemePreferences();
        this.preloadCinematicLoader();
        this.buildSamuraiSeasonsArchitecture();
        this.setupBackgroundMusic();
    },

    setupBackgroundMusic() {
        this.bgAudioInstance = new Audio(this.audioConfig.bgMusicPath);
        this.bgAudioInstance.loop = true;
        this.bgAudioInstance.volume = this.audioConfig.bgVolume;
        this.bgAudioInstance.preload = 'auto';

        const startMusic = () => {
            if (!this.bgAudioInstance) return;
            if (this.isUserMuted) return; // لا تشغلها إذا كان المستخدم مكتمها مسبقاً
            this.bgAudioInstance.play()
                .then(() => {
                    const iconEl = document.getElementById('musicToggleIcon');
                    if (iconEl && !this.currentSectionAudio) iconEl.innerText = '🔊';
                    document.removeEventListener('click', startMusic);
                    document.removeEventListener('touchstart', startMusic);
                    document.removeEventListener('keydown', startMusic);
                })
                .catch(() => {});
        };

        startMusic();
        document.addEventListener('click', startMusic);
        document.addEventListener('touchstart', startMusic);
        document.addEventListener('keydown', startMusic);
    },

    toggleBackgroundMusic() {
        const iconEl = document.getElementById('musicToggleIcon');
        const activeAudio = this.currentSectionAudio || this.bgAudioInstance;
        if (!activeAudio) return;

        if (!activeAudio.paused) {
            if (this.bgAudioInstance) this.bgAudioInstance.pause();
            if (this.currentSectionAudio) this.currentSectionAudio.pause();
            this.isUserMuted = true; // المستخدم كتم الصوت يدوياً
            if (iconEl) iconEl.innerText = '🔇';
        } else {
            this.isUserMuted = false; // المستخدم شغّل الصوت يدوياً
            activeAudio.play()
                .then(() => { if (iconEl) iconEl.innerText = '🔊'; })
                .catch(() => {});
        }
    },

    playKatanaSlashSound() {
        try {
            const clickAudio = new Audio(this.audioConfig.clickSoundPath);
            clickAudio.volume = this.audioConfig.clickVolume;
            clickAudio.currentTime = 0;
            clickAudio.play().catch(err => {});
        } catch (err) {}
    },

    playSectionSong(songFileName) {
        if (this.bgAudioInstance) {
            this.bgAudioInstance.pause();
        }

        for (let key in this.sectionAudioInstances) {
            if (this.sectionAudioInstances[key]) {
                this.sectionAudioInstances[key].pause();
                this.sectionAudioInstances[key].currentTime = 0;
            }
        }

        if (!this.sectionAudioInstances[songFileName]) {
            this.sectionAudioInstances[songFileName] = new Audio(songFileName);
            this.sectionAudioInstances[songFileName].loop = true;
            this.sectionAudioInstances[songFileName].volume = 0.5;
        }

        this.currentSectionAudio = this.sectionAudioInstances[songFileName];
        
        // تشغيل أغنية القسم فقط إذا لم يكن المستخدم مكتم الصوت بشكل عام
        if (!this.isUserMuted) {
            this.currentSectionAudio.play().catch(err => {
                console.log("حظر المتصفح لتشغيل الصوت:", err);
            });
        }

        const iconEl = document.getElementById('musicToggleIcon');
        if (iconEl && !this.isUserMuted) iconEl.innerText = '🔊';
    },

    stopAllSectionSongsAndResumeMain() {
        for (let key in this.sectionAudioInstances) {
            if (this.sectionAudioInstances[key]) {
                this.sectionAudioInstances[key].pause();
                this.sectionAudioInstances[key].currentTime = 0;
            }
        }
        this.currentSectionAudio = null;

        if (this.bgAudioInstance) {
            const iconEl = document.getElementById('musicToggleIcon');
            // إذا كان المستخدم مكتم الصوت، تبقى متوقفة تماماً
            if (this.isUserMuted) {
                this.bgAudioInstance.pause();
                if (iconEl) iconEl.innerText = '🔇';
            } else {
                this.bgAudioInstance.play().catch(err => {});
                if (iconEl) iconEl.innerText = '🔊';
            }
        }
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
        }
    },

    switchView(targetViewId) {
        if (targetViewId === 'view-home') {
            this.stopAllSectionSongsAndResumeMain();
        }

        const allSections = document.querySelectorAll('.epic-view-section');
        allSections.forEach(sec => sec.classList.remove('active'));
        const targetSec = document.getElementById(targetViewId);
        if (targetSec) {
            targetSec.classList.add('active');
            const viewport = document.getElementById('epicViewportCanvas');
            if (viewport) viewport.scrollTop = 0;
        }
    },

    seasonNames: ["", "الأول ( أبطال يوتا)", "الثاني (عهد الدم)", "الثالث", "الرابع", "الخامس", "السادس"],

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
                    openCustomAlertModal('🔒 هذا الموسم قريباً جداً.');
                };
                seasonBox.innerHTML = `
                    <div class="season-num-big">🔒</div>
                    <div class="season-name-txt">الموسم ${this.seasonNames[i].split(' ')[0]}</div>
                    <div class="season-status-pill">قريبًا </div>
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
                    <div class="epic-locked-badge">🔒 قريبًا</div>
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
        this.playKatanaSlashSound();
        const nameInput = document.getElementById('epicRaterName');
        const scoreInput = document.getElementById('epicRaterScore');

        if (!nameInput || !scoreInput) return;

        const raterName = nameInput.value.trim();
        const raterScore = parseFloat(scoreInput.value);

        if (!raterName) {
            openCustomAlertModal("عذراً، يجب إدخال اسمك أو لقبك الكريم أولاً.");
            return;
        }

        if (isNaN(raterScore) || raterScore < 0 || raterScore > 5) {
            openCustomAlertModal("قيمة التقييم غير صالحة. يجب أن تكون حصراً بين 0 و 5.");
            return;
        }

        const ratingsList = JSON.parse(localStorage.getItem(this.storageKeys.ratings) || '[]');
        ratingsList.push({ name: raterName, score: raterScore });
        localStorage.setItem(this.storageKeys.ratings, JSON.stringify(ratingsList));

        nameInput.value = '';
        scoreInput.value = '';

        this.renderRatingsStats();
        openCustomAlertModal(`أيها المحارب الباسل (${raterName}), تم توثيق تقييمك بنجاح!`);
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

function showCustomAlert(message) {
    const modal = document.getElementById('epicCustomAlertModal');
    const textEl = document.getElementById('epicAlertMessageText');
    if (textEl) textEl.innerText = message;
    if (modal) modal.style.display = 'flex';
}

function closeCustomAlert() {
    const modal = document.getElementById('epicCustomAlertModal');
    if (modal) modal.style.display = 'none';
}

function openCustomAlertModal(message) {
    SamuraiAppEngine.playKatanaSlashSound();
    showCustomAlert(message);
}

function playEpicKatanaSound() { SamuraiAppEngine.playKatanaSlashSound(); }
function switchEpicView(viewId) { SamuraiAppEngine.playKatanaSlashSound(); SamuraiAppEngine.switchView(viewId); }
function openEpicHonorModal() { SamuraiAppEngine.openModal('epicHonorModal'); }
function closeEpicHonorModal() { SamuraiAppEngine.closeModal('epicHonorModal'); }
function submitEpicRating() { SamuraiAppEngine.submitRating(); }
function toggleBackgroundMusic() { SamuraiAppEngine.toggleBackgroundMusic(); }

function openJourneySection(viewId, songFileName) {
    SamuraiAppEngine.playKatanaSlashSound();
    if (songFileName) {
        SamuraiAppEngine.playSectionSong(songFileName);
    }
    SamuraiAppEngine.switchView(viewId);
}