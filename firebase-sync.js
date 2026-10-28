/**
 * FIREBASE-SYNC.JS - Firebase Authentication & Cloud Save Persistence
 * Enables player registration, login, cloud data sync and auto-save
 * across sessions so players can always continue from where they left off.
 */

(function() {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyAw5FY5Y9dhSmi26YQfr9p_uqqtPN_XJgQ",
    authDomain: "office-7ca0e.firebaseapp.com",
    projectId: "office-7ca0e",
    storageBucket: "office-7ca0e.firebasestorage.app",
    messagingSenderId: "627346707400",
    appId: "1:627346707400:web:5ef16f59f017442ee9e6fd",
    measurementId: "G-86WZXJ0XBH"
  };

  class FirebaseSyncService {
    constructor() {
      this.app = null;
      this.auth = null;
      this.db = null;
      this.currentUser = null;
      this.currentProfile = null;
      this.hasPendingSave = false;
      this.autoSaveInterval = null;
      this.isOnline = false;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;

      try {
        if (typeof firebase !== 'undefined') {
          // Initialize Firebase App
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(firebaseConfig);
          } else {
            this.app = firebase.app();
          }

          this.auth = firebase.auth();
          this.db = firebase.firestore();
          this.isOnline = true;

          // Listen for Firebase Auth state changes
          this.auth.onAuthStateChanged(async (user) => {
            if (user) {
              this.currentUser = user;
              console.log('☁️ Firebase Auth User active:', user.email || user.uid);
              try {
                localStorage.setItem('officesim_last_uid', user.uid);
              } catch (e) {}

              const profile = await this.fetchUserProfile(user.uid);
              if (profile) {
                // Synchronize player wallet to highest saved value so money is never lost on refresh
                const inGameMoney = (window.state && window.state.player && window.state.player.money !== undefined) ? Number(window.state.player.money) : 0;
                const cloudMoney = (profile.money !== undefined) ? Number(profile.money) : 0;
                const localMoney = Number(localStorage.getItem('officesim_saved_money')) || 0;
                const highestMoney = Math.max(inGameMoney, cloudMoney, localMoney);

                profile.money = highestMoney;
                if (window.state && window.state.player) {
                  window.state.player.money = highestMoney;
                  const valEl = document.getElementById('hud-money-val');
                  if (valEl) valEl.textContent = '$' + highestMoney.toLocaleString();
                }
                try {
                  localStorage.setItem('officesim_saved_money', String(highestMoney));
                  localStorage.setItem('officesim_profile_' + user.uid, JSON.stringify(profile));
                } catch (e) {}

                // Automatically restore saved progress into the active game
                this.applySavedProgress(profile);
              }
              this.updateUIForLoggedInUser();
              this.startAutoSave();
            } else {
              this.currentUser = null;
              this.currentProfile = null;
              this.stopAutoSave();
              this.updateUIForLoggedOutUser();
            }
          });
        } else {
          console.warn('Firebase SDK script not loaded yet; running in local fallback mode.');
        }
      } catch (err) {
        console.warn('Firebase init error (fallback to local session):', err);
      }

      this.initialized = true;
      this.bindUIEvents();
    }

    /**
     * Fetch player profile and saved progress from Firestore
     */
    async fetchUserProfile(uid) {
      if (!this.db || !uid) return null;

      try {
        const docRef = this.db.collection('users').doc(uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          this.currentProfile = docSnap.data();
          // Backup locally
          try {
            localStorage.setItem('officesim_profile_' + uid, JSON.stringify(this.currentProfile));
          } catch (e) {}
          return this.currentProfile;
        } else {
          // Check local backup if new online doc
          const localStr = localStorage.getItem('officesim_profile_' + uid);
          if (localStr) {
            this.currentProfile = JSON.parse(localStr);
            return this.currentProfile;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch Firestore doc, checking localStorage backup:', err);
        const localStr = localStorage.getItem('officesim_profile_' + uid);
        if (localStr) {
          try { this.currentProfile = JSON.parse(localStr); } catch (e) {}
        }
      }

      return this.currentProfile;
    }

    /**
     * Register a new user with Email, Password & Employee Name
     */
    async signUp(name, email, password, charId = 'char1') {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid corporate or personal email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (!cleanName) {
        throw new Error('Please enter your full employee name.');
      }

      let user = null;

      if (this.auth) {
        try {
          const userCredential = await this.auth.createUserWithEmailAndPassword(cleanEmail, password);
          user = userCredential.user;
          if (user && user.updateProfile) {
            await user.updateProfile({ displayName: cleanName });
          }
        } catch (err) {
          console.warn('Firebase Auth signUp error:', err.code, err.message);
          // Helpful friendly messages
          if (err.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered. Please click "Sign In" instead.');
          } else if (err.code === 'auth/operation-not-allowed') {
            // If email auth provider is not enabled in Firebase Console, fallback gracefully to authenticated local account
            console.warn('Firebase Email/Password auth not enabled in Console; using local authenticated profile.');
            return this.signUpLocalFallback(cleanName, cleanEmail, charId);
          } else if (err.code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters.');
          } else {
            throw new Error(err.message || 'Registration failed. Check internet connection.');
          }
        }
      } else {
        return this.signUpLocalFallback(cleanName, cleanEmail, charId);
      }

      // Carry over any in-game money already earned
      const carryOverMoney = (window.state && window.state.player && window.state.player.money !== undefined)
        ? Number(window.state.player.money)
        : (Number(localStorage.getItem('officesim_saved_money')) || 0);
      const carryOverScore = (window.state && window.state.player && window.state.player.score !== undefined)
        ? Number(window.state.player.score)
        : 0;

      // Initialize base cloud save profile
      const initialProfile = {
        uid: user.uid,
        displayName: cleanName,
        email: cleanEmail,
        charId: charId,
        money: carryOverMoney,
        score: carryOverScore,
        currentScene: 'OFFICE_HALL',
        playerPos: { x: 506, y: 340, direction: 'up' },
        sprintRound: 1,
        characterTasks: null,
        completedTaskTitles: [],
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      };

      this.currentProfile = initialProfile;
      this.currentUser = user;

      // Save to Firestore
      if (this.db) {
        try {
          await this.db.collection('users').doc(user.uid).set(initialProfile);
        } catch (e) {
          console.warn('Firestore initial save warning:', e);
        }
      }

      // Also save to localStorage
      try {
        localStorage.setItem('officesim_profile_' + user.uid, JSON.stringify(initialProfile));
        localStorage.setItem('officesim_saved_money', String(carryOverMoney));
        localStorage.setItem('officesim_last_uid', user.uid);
      } catch (e) {}

      return initialProfile;
    }

    /**
     * Local fallback registration if Firebase network or Console Auth provider isn't ready
     */
    signUpLocalFallback(name, email, charId) {
      const uid = 'local_' + btoa(email).replace(/=/g, '');
      const carryOverMoney = (window.state && window.state.player && window.state.player.money !== undefined)
        ? Number(window.state.player.money)
        : (Number(localStorage.getItem('officesim_saved_money')) || 0);
      const carryOverScore = (window.state && window.state.player && window.state.player.score !== undefined)
        ? Number(window.state.player.score)
        : 0;

      const profile = {
        uid: uid,
        displayName: name,
        email: email,
        charId: charId || 'char1',
        money: carryOverMoney,
        score: carryOverScore,
        currentScene: 'OFFICE_HALL',
        playerPos: { x: 506, y: 340, direction: 'up' },
        sprintRound: 1,
        characterTasks: null,
        completedTaskTitles: [],
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      };

      this.currentUser = { uid, email, displayName: name };
      this.currentProfile = profile;
      localStorage.setItem('officesim_profile_' + uid, JSON.stringify(profile));
      localStorage.setItem('officesim_last_uid', uid);
      return profile;
    }

    /**
     * Sign In with Email & Password
     */
    async signIn(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        throw new Error('Please enter both your email address and password.');
      }

      if (this.auth) {
        try {
          const userCredential = await this.auth.signInWithEmailAndPassword(cleanEmail, password);
          const user = userCredential.user;
          this.currentUser = user;

          const profile = await this.fetchUserProfile(user.uid);
          try {
            localStorage.setItem('officesim_last_uid', user.uid);
          } catch (e) {}
          return profile || { uid: user.uid, email: cleanEmail, displayName: user.displayName || cleanEmail.split('@')[0] };
        } catch (err) {
          console.warn('Firebase signIn error:', err.code, err.message);
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            throw new Error('Incorrect email or password. Please try again or create a new account.');
          } else if (err.code === 'auth/operation-not-allowed') {
            return this.signInLocalFallback(cleanEmail);
          } else {
            // Check local fallback
            return this.signInLocalFallback(cleanEmail);
          }
        }
      } else {
        return this.signInLocalFallback(cleanEmail);
      }
    }

    signInLocalFallback(email) {
      const uid = 'local_' + btoa(email).replace(/=/g, '');
      const stored = localStorage.getItem('officesim_profile_' + uid);
      if (stored) {
        const profile = JSON.parse(stored);
        this.currentUser = { uid, email, displayName: profile.displayName };
        this.currentProfile = profile;
        localStorage.setItem('officesim_last_uid', uid);
        return profile;
      }
      throw new Error('Account not found. Please register as a new employee first.');
    }

    /**
     * Sign Out
     */
    async signOut() {
      this.stopAutoSave();
      if (this.auth && this.currentUser && !this.currentUser.uid.startsWith('local_')) {
        try {
          await this.auth.signOut();
        } catch (e) {}
      }

      this.currentUser = null;
      this.currentProfile = null;
      try {
        localStorage.removeItem('officesim_last_uid');
      } catch (e) {}

      this.updateUIForLoggedOutUser();
      if (window.showToast) {
        window.showToast('🚪 Logged out from Acme Employee Portal.');
      }
    }

    /**
     * Guest / Fast Play
     */
    playAsGuest(guestName = 'Guest Engineer') {
      const guestUid = 'guest_' + Math.random().toString(36).substring(2, 9);
      const profile = {
        uid: guestUid,
        displayName: guestName,
        email: 'guest@omnicorp.internal',
        charId: 'char1',
        money: 0,
        score: 0,
        currentScene: 'OFFICE_HALL',
        playerPos: { x: 506, y: 340, direction: 'up' },
        sprintRound: 1,
        characterTasks: null,
        completedTaskTitles: [],
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      };

      this.currentUser = { uid: guestUid, displayName: guestName, email: 'guest@omnicorp.internal' };
      this.currentProfile = profile;
      return profile;
    }

    /**
     * Save current game state to Firebase Cloud & LocalStorage
     */
    async saveProgress(showToastNotification = false) {
      if (!this.currentUser) return;
      const uid = this.currentUser.uid;

      // Extract current in-game state
      const p = window.state ? window.state.player : null;
      const currentScene = window.state ? window.state.currentScene : 'OFFICE_HALL';
      let money = (p && p.money !== undefined) ? Number(p.money) : 0;
      const savedMoney = Number(localStorage.getItem('officesim_saved_money')) || 0;
      const profileMoney = (this.currentProfile && this.currentProfile.money !== undefined) ? Number(this.currentProfile.money) : 0;

      // CRITICAL SAFEGUARD: Never overwrite a positive saved balance with $0 on a quick refresh or pre-load race condition
      if (money === 0 && (savedMoney > 0 || profileMoney > 0) && !this._explicitReset) {
        money = Math.max(savedMoney, profileMoney);
        if (p) p.money = money;
        const valEl = document.getElementById('hud-money-val');
        if (valEl) valEl.textContent = '$' + money.toLocaleString();
      }

      try {
        localStorage.setItem('officesim_saved_money', String(money));
      } catch (e) {}

      const score = (p && p.score !== undefined) ? p.score : 0;
      const charId = (p && p.charId) ? p.charId : (this.currentProfile ? this.currentProfile.charId : 'char1');

      const playerPos = p ? {
        x: Math.round(p.x),
        y: Math.round(p.y),
        direction: p.direction || 'up'
      } : { x: 506, y: 340, direction: 'up' };

      // Tasks state
      const characterTasks = window.phoneDevice && window.phoneDevice.characterTasks ? window.phoneDevice.characterTasks : null;
      const sprintRound = window.phoneDevice && window.phoneDevice.sprintRound ? window.phoneDevice.sprintRound : 1;
      const completedTaskTitles = window.phoneDevice && window.phoneDevice.completedTaskTitles
        ? Array.from(window.phoneDevice.completedTaskTitles)
        : [];

      // Mail state
      let mailState = null;
      try {
        mailState = localStorage.getItem('pc_omnimail_state_v1');
      } catch (e) {}

      const saveData = {
        uid: uid,
        displayName: (this.currentProfile && this.currentProfile.displayName) || this.currentUser.displayName || 'Employee',
        email: this.currentUser.email || 'employee@omnicorp.internal',
        charId: charId,
        money: money,
        score: score,
        currentScene: currentScene,
        playerPos: playerPos,
        sprintRound: sprintRound,
        characterTasks: characterTasks,
        completedTaskTitles: completedTaskTitles,
        mailState: mailState,
        lastSaved: new Date().toISOString(),
        lastSavedTimestamp: Date.now()
      };

      this.currentProfile = saveData;

      // 1. Save to LocalStorage immediately
      try {
        localStorage.setItem('officesim_profile_' + uid, JSON.stringify(saveData));
      } catch (e) {}

      // 2. Save to Firestore Cloud
      if (this.db && !uid.startsWith('local_') && !uid.startsWith('guest_')) {
        try {
          await this.db.collection('users').doc(uid).set(saveData, { merge: true });
          this.flashCloudSaveBadge('synced');
        } catch (err) {
          console.warn('Firestore sync failed, saved locally:', err);
          this.flashCloudSaveBadge('local');
        }
      } else {
        this.flashCloudSaveBadge('local');
      }

      if (showToastNotification && window.showToast) {
        window.showToast(`☁️ Cloud Save synced! ($${money} Coins, ${currentScene})`);
      }
    }

    /**
     * Load saved progress into game state and resume
     */
    applySavedProgress(profileData) {
      if (!profileData) profileData = this.currentProfile;
      if (!profileData) return;

      console.log('☁️ Resuming saved game progress:', profileData);

      // 1. Character & Identity
      if (window.state && window.state.player) {
        if (profileData.charId) window.state.player.charId = profileData.charId;
        window.state.player.money = Number(profileData.money) || 0;
        window.state.player.score = Number(profileData.score) || 0;

        // Update HUD Money Value
        const valEl = document.getElementById('hud-money-val');
        if (valEl) valEl.textContent = '$' + window.state.player.money.toLocaleString();

        // Update HUD Score
        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.textContent = window.state.player.score;
      }

      // 2. Restore Phone Tasks
      if (window.phoneDevice) {
        if (profileData.characterTasks) {
          window.phoneDevice.characterTasks = profileData.characterTasks;
        }
        if (profileData.sprintRound) {
          window.phoneDevice.sprintRound = profileData.sprintRound;
        }
        if (profileData.completedTaskTitles && Array.isArray(profileData.completedTaskTitles)) {
          window.phoneDevice.completedTaskTitles = new Set(profileData.completedTaskTitles);
        }
        const activeChar = profileData.charId || 'char1';
        window.phoneDevice.renderSweTaskList(activeChar);
        window.phoneDevice.updatePhoneBadge();
      }

      // 3. Restore OmniMail State
      if (profileData.mailState) {
        try {
          localStorage.setItem('pc_omnimail_state_v1', profileData.mailState);
        } catch (e) {}
      }

      // 4. Switch to saved Scene & Player coordinates
      const sceneKey = profileData.currentScene || 'OFFICE_HALL';
      const pos = profileData.playerPos || { x: 506, y: 340, direction: 'up' };

      if (typeof window.switchScene === 'function') {
        window.switchScene(sceneKey, pos.x, pos.y, pos.direction || 'down');
      }

      // Play chime & show toast
      if (window.soundManager && typeof window.soundManager.playQuestComplete === 'function') {
        window.soundManager.playQuestComplete();
      }

      if (window.showToast) {
        const sceneName = (window.SCENES && window.SCENES[sceneKey]) ? window.SCENES[sceneKey].badge : sceneKey;
        window.showToast(`☁️ Welcome back, ${profileData.displayName || 'Engineer'}! Resumed in ${sceneName} ($${profileData.money || 0} Coins).`);
      }

      // Update Header Profile Badge
      this.updateHeaderProfileBadge(profileData);
    }

    startAutoSave() {
      this.stopAutoSave();
      // Auto-save every 30 seconds
      this.autoSaveInterval = setInterval(() => {
        if (this.currentUser && window.state && !window.state.isTransitioning) {
          this.saveProgress(false);
        }
      }, 30000);
    }

    stopAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
      }
    }

    flashCloudSaveBadge(status = 'synced') {
      const badge = document.getElementById('header-cloud-status');
      if (!badge) return;

      badge.classList.remove('saving', 'synced', 'local');
      badge.classList.add(status);
      badge.title = status === 'synced' ? 'Cloud Saved to Firebase Firestore' : 'Saved to Local Device Storage';

      setTimeout(() => {
        badge.classList.remove('saving');
      }, 1200);
    }

    updateHeaderProfileBadge(profile) {
      let badge = document.getElementById('user-profile-badge');
      if (!badge) {
        const headerRight = document.querySelector('#game-header .header-right');
        if (headerRight) {
          badge = document.createElement('div');
          badge.id = 'user-profile-badge';
          badge.className = 'user-profile-badge';
          headerRight.prepend(badge);
        }
      }

      if (!badge) return;

      const name = (profile && profile.displayName) ? profile.displayName : 'Employee';
      const email = (profile && profile.email) ? profile.email : '';
      const inGameMoney = (window.state && window.state.player && window.state.player.money !== undefined) ? Number(window.state.player.money) : 0;
      const profileMoney = (profile && profile.money !== undefined) ? Number(profile.money) : 0;
      const localMoney = Number(localStorage.getItem('officesim_saved_money')) || 0;
      const money = Math.max(inGameMoney, profileMoney, localMoney);

      badge.innerHTML = `
        <div class="user-pill-wrap" id="user-pill-btn" title="Logged in as ${escapeHtml(name)} (${escapeHtml(email)}) • Click for Cloud Menu">
          <span class="user-pill-cloud" id="header-cloud-status">☁️</span>
          <span class="user-pill-name">${escapeHtml(name)}</span>
          <span class="user-pill-coins" id="user-pill-coins-val">$${money.toLocaleString()}</span>
        </div>
      `;

      const pillBtn = badge.querySelector('#user-pill-btn');
      if (pillBtn) {
        pillBtn.onclick = (e) => {
          e.stopPropagation();
          this.toggleUserDropdown();
        };
      }
    }

    toggleUserDropdown() {
      let menu = document.getElementById('user-profile-dropdown');
      if (menu) {
        menu.remove();
        return;
      }

      menu = document.createElement('div');
      menu.id = 'user-profile-dropdown';
      menu.className = 'user-profile-dropdown';

      const name = this.currentProfile ? this.currentProfile.displayName : 'Employee';
      const email = this.currentUser ? this.currentUser.email : '';
      const charNameMap = {
        char1: 'Vikram (Tech Lead)',
        char2: 'Neha (Planning Lead)',
        char3: 'Kabir (Quantum Lead)',
        char4: 'Josh (Architect)',
        char5: 'Arjun (Principal Eng)',
        char6: 'Rohan (DevOps Lead)'
      };
      const charId = (window.state && window.state.player && window.state.player.charId) || 'char1';

      menu.innerHTML = `
        <div class="user-drop-header">
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(email)}</small>
          <span class="user-drop-role">${charNameMap[charId] || 'Engineer'}</span>
        </div>
        <div class="user-drop-actions">
          <button id="btn-cloud-save-now" class="user-drop-btn">
            <span>💾</span> Save Progress to Cloud Now
          </button>
          <button id="btn-cloud-logout" class="user-drop-btn danger">
            <span>🚪</span> Switch Account / Sign Out
          </button>
        </div>
      `;

      document.body.appendChild(menu);

      const saveBtn = menu.querySelector('#btn-cloud-save-now');
      if (saveBtn) {
        saveBtn.onclick = async () => {
          await this.saveProgress(true);
          menu.remove();
        };
      }

      const logoutBtn = menu.querySelector('#btn-cloud-logout');
      if (logoutBtn) {
        logoutBtn.onclick = async () => {
          menu.remove();
          await this.signOut();
          const startModal = document.getElementById('start-menu-modal');
          if (startModal) startModal.classList.remove('hidden');
        };
      }

      // Close on outside click
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && !e.target.closest('#user-profile-badge')) {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    }

    updateUIForLoggedInUser() {
      const p = this.currentProfile;
      const startModal = document.getElementById('start-menu-modal');
      const authFormWrap = document.getElementById('auth-form-wrapper');
      const continueCard = document.getElementById('auth-continue-card');

      if (authFormWrap) authFormWrap.style.display = 'none';
      if (continueCard) {
        continueCard.style.display = 'flex';
        this.renderContinueCard(p);
      }

      this.updateHeaderProfileBadge(p);
    }

    updateUIForLoggedOutUser() {
      const authFormWrap = document.getElementById('auth-form-wrapper');
      const continueCard = document.getElementById('auth-continue-card');
      const userBadge = document.getElementById('user-profile-badge');

      if (authFormWrap) authFormWrap.style.display = 'block';
      if (continueCard) continueCard.style.display = 'none';
      if (userBadge) userBadge.remove();
    }

    renderContinueCard(profile) {
      const card = document.getElementById('auth-continue-card');
      if (!card) return;

      const name = (profile && profile.displayName) ? profile.displayName : (this.currentUser ? this.currentUser.displayName : 'Returning Employee');
      const money = (profile && profile.money !== undefined) ? profile.money : 0;
      const score = (profile && profile.score !== undefined) ? profile.score : 0;
      const scene = (profile && profile.currentScene) ? profile.currentScene : 'OFFICE_HALL';
      const charId = (profile && profile.charId) ? profile.charId : 'char1';

      const avatarMap = {
        char1: 'assets/char1_avatar.png',
        char2: 'assets/char2_avatar.png',
        char3: 'assets/char3_avatar.png',
        char4: 'assets/char4_avatar.png',
        char5: 'assets/char5_avatar.png',
        char6: 'assets/char6_avatar.png'
      };

      const charNameMap = {
        char1: 'Vikram (Tech Lead)',
        char2: 'Neha (Planning Lead)',
        char3: 'Kabir (Quantum Lead)',
        char4: 'Josh (Lead Architect)',
        char5: 'Arjun (Principal Eng)',
        char6: 'Rohan (DevOps Lead)'
      };

      const sceneNameMap = {
        OFFICE_HALL: '🏢 Main Office Hall',
        BIG_WORKPLACE: '🔬 Acme R&D Mega-Hub',
        CONFERENCE_ROOM: '👔 Executive Boardroom',
        CAFETERIA: '☕ Corporate Cafeteria',
        CORNER_OFFICE: '📋 Corner Office',
        BOSS_CABINET: '👑 Boss Executive Cabinet'
      };

      const timeStr = profile && profile.lastSaved ? new Date(profile.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';

      card.innerHTML = `
        <div class="continue-header">
          <div class="continue-avatar-wrap">
            <img src="${avatarMap[charId] || 'assets/char1_avatar.png'}" alt="${charNameMap[charId]}" class="continue-avatar" onerror="this.src='assets/char1_avatar.png'" />
            <span class="continue-cloud-tag">☁️ SYNCED</span>
          </div>
          <div class="continue-user-meta">
            <h3 class="continue-name">${escapeHtml(name)}</h3>
            <span class="continue-role">${charNameMap[charId] || 'Engineer'}</span>
            <small class="continue-time">Last Saved Cloud Progress: ${timeStr}</small>
          </div>
        </div>

        <div class="continue-stats-grid">
          <div class="continue-stat-box">
            <span class="stat-box-label">WALLET</span>
            <strong class="stat-box-val gold">$${money.toLocaleString()}</strong>
          </div>
          <div class="continue-stat-box">
            <span class="stat-box-label">CAREER XP</span>
            <strong class="stat-box-val cyan">${score} XP</strong>
          </div>
          <div class="continue-stat-box full">
            <span class="stat-box-label">LAST LOCATION</span>
            <strong class="stat-box-val">${sceneNameMap[scene] || scene}</strong>
          </div>
        </div>

        <div class="continue-actions-row">
          <button id="btn-continue-game" class="btn-pixel-primary continue-play-btn">
            ▶ CONTINUE WHERE YOU LEFT OFF
          </button>
          <div class="continue-sub-row">
            <button id="btn-switch-account" class="btn-subtle-auth">
              Switch Account
            </button>
            <button id="btn-restart-progress" class="btn-subtle-auth danger">
              Start New Fresh Office
            </button>
          </div>
        </div>
      `;

      // Continue Game
      const contBtn = card.querySelector('#btn-continue-game');
      if (contBtn) {
        contBtn.onclick = () => {
          const startModal = document.getElementById('start-menu-modal');
          if (startModal) startModal.classList.add('hidden');
          this.applySavedProgress(profile);
        };
      }

      // Switch Account
      const switchBtn = card.querySelector('#btn-switch-account');
      if (switchBtn) {
        switchBtn.onclick = async () => {
          await this.signOut();
        };
      }

      // Restart fresh
      const restartBtn = card.querySelector('#btn-restart-progress');
      if (restartBtn) {
        restartBtn.onclick = () => {
          if (confirm('Start a fresh session from $0? Your previous cloud save will be overwritten as you play.')) {
            const fresh = {
              ...profile,
              money: 0,
              score: 0,
              currentScene: 'OFFICE_HALL',
              playerPos: { x: 506, y: 340, direction: 'up' },
              sprintRound: 1
            };
            const startModal = document.getElementById('start-menu-modal');
            if (startModal) startModal.classList.add('hidden');
            this.applySavedProgress(fresh);
            this.saveProgress(true);
          }
        };
      }
    }

    bindUIEvents() {
      // 1. Tab Switching (Sign In / Register / Guest)
      const tabSignIn = document.getElementById('auth-tab-signin');
      const tabRegister = document.getElementById('auth-tab-register');
      const formSignIn = document.getElementById('auth-form-signin');
      const formRegister = document.getElementById('auth-form-register');
      const authError = document.getElementById('auth-error-msg');

      const clearError = () => {
        if (authError) {
          authError.textContent = '';
          authError.style.display = 'none';
        }
      };

      const showError = (msg) => {
        if (authError) {
          authError.textContent = msg;
          authError.style.display = 'block';
          if (window.soundManager && typeof window.soundManager.playWindowsError === 'function') {
            window.soundManager.playWindowsError();
          }
        }
      };

      if (tabSignIn && tabRegister && formSignIn && formRegister) {
        tabSignIn.onclick = () => {
          tabSignIn.classList.add('active');
          tabRegister.classList.remove('active');
          formSignIn.style.display = 'flex';
          formRegister.style.display = 'none';
          clearError();
        };

        tabRegister.onclick = () => {
          tabRegister.classList.add('active');
          tabSignIn.classList.remove('active');
          formRegister.style.display = 'flex';
          formSignIn.style.display = 'none';
          clearError();
        };
      }

      // 2. Sign In Form Submit
      const btnSubmitSignIn = document.getElementById('btn-submit-signin');
      if (btnSubmitSignIn) {
        btnSubmitSignIn.onclick = async (e) => {
          e.preventDefault();
          clearError();

          const emailInput = document.getElementById('input-signin-email');
          const passInput = document.getElementById('input-signin-password');
          const email = emailInput ? emailInput.value : '';
          const pass = passInput ? passInput.value : '';

          btnSubmitSignIn.disabled = true;
          btnSubmitSignIn.innerHTML = '<span>⏳</span> SIGNING IN...';

          try {
            const profile = await this.signIn(email, pass);
            const startModal = document.getElementById('start-menu-modal');
            if (startModal) startModal.classList.add('hidden');
            this.applySavedProgress(profile);
          } catch (err) {
            showError(err.message || 'Login failed. Please verify credentials.');
          } finally {
            btnSubmitSignIn.disabled = false;
            btnSubmitSignIn.innerHTML = '<span>🔑</span> SIGN IN &amp; CONTINUE';
          }
        };
      }

      // 3. Register Form Submit
      const btnSubmitRegister = document.getElementById('btn-submit-register');
      if (btnSubmitRegister) {
        btnSubmitRegister.onclick = async (e) => {
          e.preventDefault();
          clearError();

          const nameInput = document.getElementById('input-register-name');
          const emailInput = document.getElementById('input-register-email');
          const passInput = document.getElementById('input-register-password');
          const selectedCharEl = document.querySelector('.auth-char-option.selected');

          const name = nameInput ? nameInput.value : '';
          const email = emailInput ? emailInput.value : '';
          const pass = passInput ? passInput.value : '';
          const charId = selectedCharEl ? selectedCharEl.getAttribute('data-char') : 'char1';

          btnSubmitRegister.disabled = true;
          btnSubmitRegister.innerHTML = '<span>⏳</span> CREATING ACCOUNT...';

          try {
            const profile = await this.signUp(name, email, pass, charId);
            const startModal = document.getElementById('start-menu-modal');
            if (startModal) startModal.classList.add('hidden');
            this.applySavedProgress(profile);
          } catch (err) {
            showError(err.message || 'Registration failed.');
          } finally {
            btnSubmitRegister.disabled = false;
            btnSubmitRegister.innerHTML = '<span>📝</span> REGISTER &amp; JOIN ACME';
          }
        };
      }

      // 4. Character Option Selection in Register Tab
      const charOptions = document.querySelectorAll('.auth-char-option');
      charOptions.forEach(opt => {
        opt.onclick = () => {
          charOptions.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
        };
      });

      // 5. Guest Fast Play
      const btnGuestPlay = document.getElementById('btn-auth-guest-play');
      if (btnGuestPlay) {
        btnGuestPlay.onclick = () => {
          const profile = this.playAsGuest('Guest Engineer');
          const startModal = document.getElementById('start-menu-modal');
          if (startModal) startModal.classList.add('hidden');
          this.applySavedProgress(profile);
        };
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Global Singleton
  window.firebaseSync = new FirebaseSyncService();

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.firebaseSync.init());
  } else {
    window.firebaseSync.init();
  }

})();
